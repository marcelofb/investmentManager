const BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';
const CACHE_TTL_MS = 5 * 60 * 1000;

const cache = {
  data: {},
  timestamp: null,
};

function normalizeTicker(ticker) {
  const raw = String(ticker ?? '').trim();
  if (!raw) throw new Error('Ticker requerido');

  const upper = raw.toUpperCase();
  return upper.endsWith('.BA') ? upper : `${upper}.BA`;
}

export async function getPriceBA(ticker) {
  const symbol = normalizeTicker(ticker);

  if (
    cache.timestamp &&
    Date.now() - cache.timestamp < CACHE_TTL_MS &&
    cache.data[symbol]
  ) {
    return cache.data[symbol];
  }

  const url = `${BASE_URL}/${symbol}?range=1d&interval=1d`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Yahoo Finance error: ${res.status}`);
  }

  const json = await res.json();
  const price = json?.chart?.result?.[0]?.meta?.regularMarketPrice;
  const currency = json?.chart?.result?.[0]?.meta?.currency ?? 'ARS';

  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`No se pudo obtener precio para ${symbol}`);
  }

  const payload = {
    symbol,
    price: Number(price),
    currency,
    timestamp: Date.now(),
  };

  cache.data[symbol] = payload;
  cache.timestamp = Date.now();
  return payload;
}

export async function getPrices(tickers) {
  if (!tickers || tickers.length === 0) return {};

  const uniqueTickers = [...new Set(tickers.map((ticker) => normalizeTicker(ticker)))];
  const results = {};

  for (const ticker of uniqueTickers) {
    const cached = cache.data[ticker];
    if (cache.timestamp && Date.now() - cache.timestamp < CACHE_TTL_MS && cached) {
      results[ticker] = cached;
      continue;
    }

    const priceData = await getPriceBA(ticker);
    results[ticker] = priceData;
  }

  return results;
}
