import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error('REDIS_URL is not defined in the environment variables (e.g., Upstash or Redis Cloud URL).');
  process.exit(1);
}

// Upstash requires rediss:// (TLS). Socket config ensures the TLS handshake
// succeeds and caps reconnect attempts to avoid an infinite connect/drop loop.
const redisClient = createClient({
  url: redisUrl,
  socket: {
    tls: redisUrl.startsWith('rediss://'),
    reconnectStrategy: (retries) => {
      if (retries >= 5) {
        console.error('Redis: max reconnect attempts reached. Giving up.');
        return new Error('Too many retries');
      }
      // Exponential back-off: 500ms, 1s, 2s, 4s, 8s
      return Math.min(500 * 2 ** retries, 8000);
    },
  },
});

redisClient.on('error', (err) => {
  console.error(`Redis Client Error: ${err.message}`);
});

redisClient.on('connect', () => {
  console.log('Redis client connected successfully');
});

redisClient.on('reconnecting', () => {
  console.log('Redis client reconnecting…');
});

export default redisClient;
