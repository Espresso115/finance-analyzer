import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl
});

redisClient.on('error', (err) => {
  console.error(`Redis Client Error: ${err.message}`);
});

redisClient.on('connect', () => {
  console.log('Redis client connected successfully');
});

export default redisClient;
