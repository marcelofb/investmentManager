const BASE_URL = 'https://api.coingecko.com/api/v3';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

const cache = {
  data: {},
  timestamp: null,
};

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
  const res = await fetch(url);

  if (!res.ok) {
    // Si hay caché aunque sea vencida, devolverla en lugar de fallar
    if (cache.timestamp) return cache.data;
    throw new Error(`CoinGecko API error: ${res.status}`);
  }

  const fresh = await res.json();
  // Merge con caché existente para no perder otros activos ya cacheados
  cache.data = { ...cache.data, ...fresh };
  cache.timestamp = Date.now();

  return cache.data;
}
