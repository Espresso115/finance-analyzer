import redisClient from '../config/redis.js';

const CACHE_TTL = 60; // 60 seconds

export const fetchMarketQuote = async (symbol) => {
  const cacheKey = `market:quote:${symbol.toUpperCase()}`;

  // 1. Try reading from cache if Redis is connected
  if (redisClient.isOpen) {
    try {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        console.log(`Cache HIT for symbol: ${symbol}`);
        return {
          ...JSON.parse(cachedData),
          cached: true
        };
      }
    } catch (err) {
      console.error(`Redis cache read error: ${err.message}`);
    }
  }

  // 2. Cache miss: Fetch/generate market data
  console.log(`Cache MISS for symbol: ${symbol}`);
  
  // Simulated premium market data provider
  const basePrice = {
    AAPL: 175.50,
    MSFT: 420.20,
    GOOGL: 150.80,
    AMZN: 178.40,
    TSLA: 170.30
  }[symbol.toUpperCase()] || 100.00;

  const mockPrice = (basePrice + (Math.random() - 0.5) * 5).toFixed(2);
  const quoteData = {
    symbol: symbol.toUpperCase(),
    price: parseFloat(mockPrice),
    change: parseFloat(((Math.random() - 0.5) * 2).toFixed(2)),
    volume: Math.floor(Math.random() * 1000000) + 50000,
    lastUpdated: new Date().toISOString()
  };

  // 3. Store in Redis cache if Redis is connected
  if (redisClient.isOpen) {
    try {
      await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(quoteData));
    } catch (err) {
      console.error(`Redis cache write error: ${err.message}`);
    }
  }

  return {
    ...quoteData,
    cached: false
  };
};
