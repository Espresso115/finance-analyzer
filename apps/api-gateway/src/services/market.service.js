import yahooFinance from 'yahoo-finance2';
import redisClient from '../config/redis.js';

const CACHE_TTL = 60; // 60 seconds
const HISTORY_CACHE_TTL = 300;

export const SUPPORTED_ASSET_TYPES = ['stock', 'crypto', 'forex'];

const INSTRUMENTS = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', exchange: 'NASDAQ', currency: 'USD', basePrice: 175.5 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', exchange: 'NASDAQ', currency: 'USD', basePrice: 420.2 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', exchange: 'NASDAQ', currency: 'USD', basePrice: 150.8 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', exchange: 'NASDAQ', currency: 'USD', basePrice: 178.4 },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', exchange: 'NASDAQ', currency: 'USD', basePrice: 170.3 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', exchange: 'NASDAQ', currency: 'USD', basePrice: 915.2 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock', exchange: 'NYSE', currency: 'USD', basePrice: 201.7 },
  { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto', exchange: 'Crypto', currency: 'USD', basePrice: 68450 },
  { symbol: 'ETH-USD', name: 'Ethereum', type: 'crypto', exchange: 'Crypto', currency: 'USD', basePrice: 3650 },
  { symbol: 'SOL-USD', name: 'Solana', type: 'crypto', exchange: 'Crypto', currency: 'USD', basePrice: 154 },
  { symbol: 'EURUSD', name: 'Euro / US Dollar', type: 'forex', exchange: 'FX', currency: 'USD', basePrice: 1.08 },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', type: 'forex', exchange: 'FX', currency: 'USD', basePrice: 1.27 },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', type: 'forex', exchange: 'FX', currency: 'JPY', basePrice: 156.8 }
];

// Map forex symbols to Yahoo Finance format (EURUSD -> EURUSD=X)
const toYahooSymbol = (symbol) => {
  const normalized = normalizeSymbol(symbol);
  const instrument = INSTRUMENTS.find((i) => i.symbol === normalized);
  if (instrument && instrument.type === 'forex') {
    return `${normalized}=X`;
  }
  return normalized;
};

const SYMBOL_PATTERN = /^[A-Z0-9.-]{1,12}$/;
const RANGE_DAYS = {
  '7d': 7,
  '30d': 30,
  '90d': 90
};

const normalizeSymbol = (symbol) => String(symbol || '').trim().toUpperCase();

export const isValidMarketSymbol = (symbol) => SYMBOL_PATTERN.test(normalizeSymbol(symbol));

const getInstrument = (symbol) => {
  const normalizedSymbol = normalizeSymbol(symbol);
  return (
    INSTRUMENTS.find((instrument) => instrument.symbol === normalizedSymbol) || {
      symbol: normalizedSymbol,
      name: `${normalizedSymbol} Market Instrument`,
      type: 'stock',
      exchange: 'Unknown',
      currency: 'USD',
      basePrice: 100
    }
  );
};

// ── Simulated fallback (used when Yahoo Finance is unreachable) ──────────────

const seededNoise = (seed, amplitude = 1) => {
  const x = Math.sin(seed) * 10000;
  return (x - Math.floor(x) - 0.5) * amplitude;
};

const getSymbolSeed = (symbol) =>
  normalizeSymbol(symbol)
    .split('')
    .reduce((total, character) => total + character.charCodeAt(0), 0);

const buildSimulatedQuote = (symbol) => {
  const instrument = getInstrument(symbol);
  const seed = getSymbolSeed(instrument.symbol);
  const minuteBucket = Math.floor(Date.now() / 60000);
  const movement = seededNoise(seed + minuteBucket, instrument.basePrice * 0.028);
  const previousClose = instrument.basePrice + seededNoise(seed + minuteBucket - 1, instrument.basePrice * 0.02);
  const price = Number(Math.max(0.01, instrument.basePrice + movement).toFixed(instrument.type === 'forex' ? 4 : 2));
  const change = Number((price - previousClose).toFixed(instrument.type === 'forex' ? 4 : 2));
  const changePercent = Number(((change / previousClose) * 100).toFixed(2));

  return {
    symbol: instrument.symbol,
    name: instrument.name,
    type: instrument.type,
    exchange: instrument.exchange,
    currency: instrument.currency,
    price,
    change,
    changePercent,
    volume: Math.floor(Math.abs(seededNoise(seed + minuteBucket, 1)) * 1200000) + 50000,
    lastUpdated: new Date().toISOString(),
    source: 'simulated'
  };
};

const buildSimulatedHistory = (symbol, range) => {
  const instrument = getInstrument(symbol);
  const days = RANGE_DAYS[range] || 30;
  const seed = getSymbolSeed(instrument.symbol);
  const now = new Date();
  return Array.from({ length: days }, (_, index) => {
    const pointDate = new Date(now);
    pointDate.setDate(now.getDate() - (days - index - 1));
    const trend = (index - days / 2) * instrument.basePrice * 0.0018;
    const wave = Math.sin((index + seed) / 3) * instrument.basePrice * 0.018;
    const noise = seededNoise(seed + index, instrument.basePrice * 0.012);
    const close = Number(
      Math.max(0.01, instrument.basePrice + trend + wave + noise).toFixed(
        instrument.type === 'forex' ? 4 : 2
      )
    );
    return {
      date: pointDate.toISOString().slice(0, 10),
      close,
      volume: Math.floor(Math.abs(seededNoise(seed + index + 13, 1)) * 900000) + 40000
    };
  });
};

// ── Yahoo Finance: real data fetching ────────────────────────────────────────

const buildRealQuote = async (symbol) => {
  const instrument = getInstrument(symbol);
  const yahooSym = toYahooSymbol(symbol);

  const result = await yahooFinance.quote(yahooSym);

  const price = result.regularMarketPrice ?? 0;
  const change = result.regularMarketChange ?? 0;
  const changePercent = result.regularMarketChangePercent ?? 0;

  return {
    symbol: instrument.symbol,
    name: result.shortName || result.longName || instrument.name,
    type: instrument.type,
    exchange: result.exchange || instrument.exchange,
    currency: result.currency || instrument.currency,
    price: Number(price.toFixed(instrument.type === 'forex' ? 4 : 2)),
    change: Number(change.toFixed(instrument.type === 'forex' ? 4 : 2)),
    changePercent: Number(changePercent.toFixed(2)),
    volume: result.regularMarketVolume ?? 0,
    lastUpdated: new Date().toISOString(),
    source: 'yahoo'
  };
};

const buildRealHistory = async (symbol, range) => {
  const yahooSym = toYahooSymbol(symbol);
  const days = RANGE_DAYS[range] || 30;

  const period1 = new Date();
  period1.setDate(period1.getDate() - days);

  const result = await yahooFinance.chart(yahooSym, {
    period1: period1.toISOString().slice(0, 10),
    interval: '1d'
  });

  const quotes = result.quotes || [];
  return quotes
    .filter((q) => q.close != null)
    .map((q) => ({
      date: new Date(q.date).toISOString().slice(0, 10),
      close: Number(q.close.toFixed(2)),
      volume: q.volume ?? 0
    }));
};

// ── Public API (with cache + graceful fallback) ──────────────────────────────

export const fetchMarketQuote = async (symbol) => {
  const normalizedSymbol = normalizeSymbol(symbol);
  const cacheKey = `market:quote:${normalizedSymbol}`;

  // 1. Try cache
  if (redisClient.isOpen) {
    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log(`Cache HIT for symbol: ${normalizedSymbol}`);
        return { ...JSON.parse(cachedData), cached: true };
      }
    } catch (err) {
      console.error(`Redis cache read error: ${err.message}`);
    }
  }

  // 2. Try Yahoo Finance, fall back to simulated
  console.log(`Cache MISS for symbol: ${normalizedSymbol}`);
  let quoteData;
  try {
    quoteData = await buildRealQuote(normalizedSymbol);
    console.log(`Yahoo Finance OK for: ${normalizedSymbol}`);
  } catch (err) {
    console.warn(`Yahoo Finance failed for ${normalizedSymbol}: ${err.message}. Using simulated data.`);
    quoteData = buildSimulatedQuote(normalizedSymbol);
  }

  // 3. Cache result
  if (redisClient.isOpen) {
    try {
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(quoteData));
    } catch (err) {
      console.error(`Redis cache write error: ${err.message}`);
    }
  }

  return { ...quoteData, cached: false };
};

export const searchMarketInstruments = ({ query = '', type } = {}) => {
  const normalizedQuery = String(query).trim().toUpperCase();
  const normalizedType = String(type || '').trim().toLowerCase();

  return INSTRUMENTS.filter((instrument) => {
    const matchesType = !normalizedType || instrument.type === normalizedType;
    const matchesQuery =
      !normalizedQuery ||
      instrument.symbol.includes(normalizedQuery) ||
      instrument.name.toUpperCase().includes(normalizedQuery);

    return matchesType && matchesQuery;
  }).slice(0, 12);
};

export const fetchMarketHistory = async (symbol, range = '30d') => {
  const normalizedSymbol = normalizeSymbol(symbol);
  const normalizedRange = RANGE_DAYS[range] ? range : '30d';
  const cacheKey = `market:history:${normalizedSymbol}:${normalizedRange}`;

  if (redisClient.isOpen) {
    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        return {
          symbol: normalizedSymbol,
          range: normalizedRange,
          points: JSON.parse(cachedData),
          cached: true
        };
      }
    } catch (err) {
      console.error(`Redis history cache read error: ${err.message}`);
    }
  }

  // Try Yahoo Finance, fall back to simulated
  let points;
  try {
    points = await buildRealHistory(normalizedSymbol, normalizedRange);
    if (!points.length) throw new Error('Empty history');
    console.log(`Yahoo Finance history OK for: ${normalizedSymbol} (${normalizedRange})`);
  } catch (err) {
    console.warn(`Yahoo Finance history failed for ${normalizedSymbol}: ${err.message}. Using simulated.`);
    points = buildSimulatedHistory(normalizedSymbol, normalizedRange);
  }

  if (redisClient.isOpen) {
    try {
      await redisClient.setEx(cacheKey, HISTORY_CACHE_TTL, JSON.stringify(points));
    } catch (err) {
      console.error(`Redis history cache write error: ${err.message}`);
    }
  }

  return {
    symbol: normalizedSymbol,
    range: normalizedRange,
    points,
    cached: false
  };
};

export const fetchMarketSummary = async (symbols = []) => {
  const normalizedSymbols = symbols
    .map(normalizeSymbol)
    .filter((symbol, index, allSymbols) => isValidMarketSymbol(symbol) && allSymbols.indexOf(symbol) === index)
    .slice(0, 12);

  const quotes = await Promise.all(normalizedSymbols.map((symbol) => fetchMarketQuote(symbol)));
  return quotes;
};

export const serializeQuotesCsv = (quotes) => {
  const header = 'symbol,name,type,exchange,currency,price,change,changePercent,volume,lastUpdated';
  const rows = quotes.map((quote) =>
    [
      quote.symbol,
      `"${String(quote.name).replaceAll('"', '""')}"`,
      quote.type,
      quote.exchange,
      quote.currency,
      quote.price,
      quote.change,
      quote.changePercent,
      quote.volume,
      quote.lastUpdated
    ].join(',')
  );

  return [header, ...rows].join('\n');
};
