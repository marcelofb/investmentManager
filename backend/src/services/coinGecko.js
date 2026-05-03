const BASE_URL = 'https://api.coincap.io/v2';
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

  const params = new URLSearchParams({ ids: uniqueIds.join(',') });
  const url = `${BASE_URL}/assets?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    // Si hay caché aunque sea vencida, devolverla en lugar de fallar
    console.error(`CoinCap API error: ${res.status}`);
    if (cache.timestamp) return cache.data;
    throw new Error(`CoinCap API error: ${res.status}`);
  }

  const json = await res.json();
  // Convertir formato CoinCap { data: [{ id, priceUsd }] }
  // al formato esperado: { bitcoin: { usd: 60000 }, ... }
  const fresh = {};
  for (const asset of json.data ?? []) {
    fresh[asset.id] = { usd: parseFloat(asset.priceUsd) };
  }
  // Merge con caché existente para no perder otros activos ya cacheados
  cache.data = { ...cache.data, ...fresh };
  cache.timestamp = Date.now();

  return cache.data;
}
