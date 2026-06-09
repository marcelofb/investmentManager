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

  const url = `${BASE_URL}/simple/price?ids=${uniqueIds.join(',')}&vs_currencies=usd`;

  const headers = { Accept: 'application/json' };
  if (process.env.COINGECKO_API_KEY) {
    headers['x-cg-demo-api-key'] = process.env.COINGECKO_API_KEY;
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.error(`CoinGecko API error: ${res.status}`);
      if (cache.timestamp) return cache.data;
      throw new Error(`CoinGecko API error: ${res.status}`);
    }

    const json = await res.json();
    // CoinGecko ya devuelve { bitcoin: { usd: 78000 }, ... }
    cache.data = { ...cache.data, ...json };
    cache.timestamp = Date.now();
    return cache.data;
  } catch (err) {
    console.error(`CoinGecko fetch error: ${err.message}`);
    if (cache.timestamp) return cache.data;
    throw err;
  }
}
