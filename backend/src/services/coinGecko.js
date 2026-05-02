const BASE_URL = 'https://api.coingecko.com/api/v3';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
const MAX_RETRIES = 2;
const RETRY_BASE_MS = 1000;

import CryptoPriceCache from '../models/CryptoPriceCache.js';

const cache = {
  data: {},
  timestamp: null,
};

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRetryDelay(attempt, retryAfterHeader) {
  const retryAfterSeconds = Number(retryAfterHeader);
  if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
    return retryAfterSeconds * 1000;
  }
  return RETRY_BASE_MS * 2 ** attempt;
}

async function persistPrices(fresh) {
  const entries = Object.entries(fresh).filter(
    ([, value]) => value && typeof value.usd === 'number'
  );
  if (entries.length === 0) return;

  await CryptoPriceCache.bulkWrite(
    entries.map(([activo, value]) => ({
      updateOne: {
        filter: { activo },
        update: {
          $set: {
            activo,
            usd: value.usd,
            fetchedAt: new Date(),
          },
        },
        upsert: true,
      },
    }))
  );
}

async function getPersistedPrices(ids) {
  const docs = await CryptoPriceCache.find({ activo: { $in: ids } }).lean();
  return docs.reduce((acc, doc) => {
    acc[doc.activo] = { usd: doc.usd };
    return acc;
  }, {});
}

export async function getPrices(ids) {
  if (!ids || ids.length === 0) return {};

  const uniqueIds = [...new Set(ids)];

  // Devolver caché si está vigente y contiene todos los ids pedidos
  if (
    cache.timestamp &&
    Date.now() - cache.timestamp < CACHE_TTL_MS &&
    uniqueIds.every((id) => id in cache.data)
  ) {
    return cache.data;
  }

  const idsStr = uniqueIds.join(',');
  const params = new URLSearchParams({
    ids: idsStr,
    vs_currencies: 'usd',
  });

  const url = `${BASE_URL}/simple/price?${params.toString()}`;

  let lastStatus = 0;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const res = await fetch(url);

    if (res.ok) {
      const fresh = await res.json();
      // Merge con caché existente para no perder otros activos ya cacheados
      cache.data = { ...cache.data, ...fresh };
      cache.timestamp = Date.now();
      await persistPrices(fresh);
      return cache.data;
    }

    lastStatus = res.status;
    if (res.status !== 429 || attempt === MAX_RETRIES) {
      break;
    }

    const retryAfter = res.headers.get('retry-after');
    const delay = getRetryDelay(attempt, retryAfter);
    await wait(delay);
  }

  // Si hay caché aunque sea vencida, devolverla en lugar de fallar
  if (cache.timestamp) return cache.data;

  const persisted = await getPersistedPrices(uniqueIds);
  if (Object.keys(persisted).length > 0) {
    cache.data = { ...cache.data, ...persisted };
    cache.timestamp = Date.now();
    return cache.data;
  }

  if (lastStatus === 429) {
    console.warn('CoinGecko devolvio 429 y no habia cache persistida; se devuelve dataset vacio.');
    return {};
  }

  console.warn(`CoinGecko fallo (${lastStatus || 'unknown'}) y no habia cache persistida; se devuelve dataset vacio.`);
  return {};
}
