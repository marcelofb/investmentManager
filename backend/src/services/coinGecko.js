const BASE_URL = 'https://api.binance.com/api/v3';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

// Mapa de IDs de CoinGecko a símbolos de Binance
const COINGECKO_TO_BINANCE = {
  'bitcoin': 'BTCUSDT',
  'ethereum': 'ETHUSDT',
  'solana': 'SOLUSDT',
  'binancecoin': 'BNBUSDT',
  'ripple': 'XRPUSDT',
  'cardano': 'ADAUSDT',
  'dogecoin': 'DOGEUSDT',
  'shiba-inu': 'SHIBUSDT',
  'polkadot': 'DOTUSDT',
  'avalanche-2': 'AVAXUSDT',
  'matic-network': 'MATICUSDT',
  'polygon-ecosystem-token': 'POLUSDT',
  'chainlink': 'LINKUSDT',
  'uniswap': 'UNIUSDT',
  'litecoin': 'LTCUSDT',
  'cosmos': 'ATOMUSDT',
  'near': 'NEARUSDT',
  'arbitrum': 'ARBIUSDT',
  'optimism': 'OPUSDT',
  'sui': 'SUIUSDT',
  'aptos': 'APTUSDT',
  'pepe': 'PEPEUSDT',
  'wrapped-bitcoin': 'WBTCUSDT',
  'bitcoin-cash': 'BCHUSDT',
  'stellar': 'XLMUSDT',
  'tron': 'TRXUSDT',
  'monero': 'XMRUSDT',
  'ethereum-classic': 'ETCUSDT',
  'filecoin': 'FILUSDT',
  'internet-computer': 'ICPUSDT',
  'hedera-hashgraph': 'HBARUSDT',
  'the-graph': 'GRTUSDT',
  'aave': 'AAVEUSDT',
  'maker': 'MKRUSDT',
  'fantom': 'FTMUSDT',
  'algorand': 'ALGOUSDT',
  'vechain': 'VETUSDT',
  'render-token': 'RENDERUSDT',
  'injective-protocol': 'INJUSDT',
  'sei-network': 'SEIUSDT',
  'celestia': 'TIAUSDT',
  'bonk': 'BONKUSDT',
  'jupiter-exchange-solana': 'JUPUSDT',
  'pyth-network': 'PYTHUSDT',
};

function toBinanceSymbol(geckoId) {
  return COINGECKO_TO_BINANCE[geckoId] ?? `${geckoId.replace(/-/g, '').toUpperCase()}USDT`;
}

const cache = {
  data: {},
  timestamp: null,
};

async function fetchBinancePrices(geckoIds) {
  const symbolToId = Object.fromEntries(geckoIds.map((id) => [toBinanceSymbol(id), id]));
  const symbols = Object.keys(symbolToId);
  const url = `${BASE_URL}/ticker/price?symbols=${encodeURIComponent(JSON.stringify(symbols))}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });

  if (res.ok) {
    const json = await res.json();
    const result = {};
    for (const item of json) {
      const geckoId = symbolToId[item.symbol];
      if (geckoId) result[geckoId] = { usd: parseFloat(item.price) };
    }
    return result;
  }

  // Si el batch falla (ej: símbolo inválido), intentar de a uno
  if (geckoIds.length === 1) {
    console.warn(`Binance: símbolo no encontrado para "${geckoIds[0]}" (${symbols[0]})`);
    return {};
  }

  const results = await Promise.all(geckoIds.map((id) => fetchBinancePrices([id])));
  return Object.assign({}, ...results);
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

  try {
    const fresh = await fetchBinancePrices(uniqueIds);
    cache.data = { ...cache.data, ...fresh };
    cache.timestamp = Date.now();
    return cache.data;
  } catch (err) {
    console.error(`Binance API error: ${err.message}`);
    if (cache.timestamp) return cache.data;
    throw err;
  }
}
