const BASE_URL = 'https://min-api.cryptocompare.com/data';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

// Mapa de IDs de CoinGecko a tickers de CryptoCompare
const COINGECKO_TO_CC = {
  'bitcoin': 'BTC',
  'ethereum': 'ETH',
  'tether': 'USDT',
  'solana': 'SOL',
  'binancecoin': 'BNB',
  'ripple': 'XRP',
  'cardano': 'ADA',
  'dogecoin': 'DOGE',
  'shiba-inu': 'SHIB',
  'polkadot': 'DOT',
  'avalanche-2': 'AVAX',
  'matic-network': 'MATIC',
  'polygon-ecosystem-token': 'POL',
  'chainlink': 'LINK',
  'uniswap': 'UNI',
  'litecoin': 'LTC',
  'cosmos': 'ATOM',
  'near': 'NEAR',
  'arbitrum': 'ARB',
  'optimism': 'OP',
  'sui': 'SUI',
  'aptos': 'APT',
  'pepe': 'PEPE',
  'wrapped-bitcoin': 'WBTC',
  'bitcoin-cash': 'BCH',
  'stellar': 'XLM',
  'tron': 'TRX',
  'monero': 'XMR',
  'ethereum-classic': 'ETC',
  'filecoin': 'FIL',
  'internet-computer': 'ICP',
  'hedera-hashgraph': 'HBAR',
  'the-graph': 'GRT',
  'aave': 'AAVE',
  'maker': 'MKR',
  'fantom': 'FTM',
  'algorand': 'ALGO',
  'vechain': 'VET',
  'render-token': 'RENDER',
  'injective-protocol': 'INJ',
  'sei-network': 'SEI',
  'celestia': 'TIA',
  'bonk': 'BONK',
  'jupiter-exchange-solana': 'JUP',
  'pyth-network': 'PYTH',
  'usd-coin': 'USDC',
  'dai': 'DAI',
};

function toCCSymbol(geckoId) {
  return COINGECKO_TO_CC[geckoId] ?? geckoId.replace(/-/g, '').toUpperCase();
}

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

  const symbolToId = Object.fromEntries(uniqueIds.map((id) => [toCCSymbol(id), id]));
  const fsyms = Object.keys(symbolToId).join(',');
  const url = `${BASE_URL}/pricemulti?fsyms=${fsyms}&tsyms=USD`;

  const headers = { Accept: 'application/json' };
  if (process.env.CRYPTOCOMPARE_API_KEY) {
    headers['authorization'] = `Apikey ${process.env.CRYPTOCOMPARE_API_KEY}`;
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.error(`CryptoCompare API error: ${res.status}`);
      if (cache.timestamp) return cache.data;
      throw new Error(`CryptoCompare API error: ${res.status}`);
    }

    const json = await res.json();
    // Convertir { BTC: { USD: 78000 } } → { bitcoin: { usd: 78000 } }
    const fresh = {};
    for (const [symbol, prices] of Object.entries(json)) {
      const geckoId = symbolToId[symbol];
      if (geckoId && prices.USD != null) fresh[geckoId] = { usd: prices.USD };
    }
    cache.data = { ...cache.data, ...fresh };
    cache.timestamp = Date.now();
    return cache.data;
  } catch (err) {
    console.error(`CryptoCompare fetch error: ${err.message}`);
    if (cache.timestamp) return cache.data;
    throw err;
  }
}
