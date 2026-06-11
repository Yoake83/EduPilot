import { Redis } from 'ioredis';

const url = process.env.REDIS_URL || 'redis://localhost:6379';

const isTLS = url.startsWith('rediss');

function createRedis(overrides = {}) {
  return new Redis(url, {
    ...(isTLS ? { tls: { rejectUnauthorized: false } } : {}),
    connectTimeout: 10000,
    keepAlive: 10000,
    retryStrategy: (times) => {
      if (times > 3) return null; // stop retrying after 3 attempts
      return Math.min(times * 500, 2000);
    },
    reconnectOnError: () => false,
    enableOfflineQueue: true,
    ...overrides,
  });
}

export const redis = createRedis();
export const redisForBull = createRedis({ maxRetriesPerRequest: null });

redis.on('error', (err) => {
  if (!err.message.includes('ECONNRESET')) {
    console.error('[redis] error:', err.message);
  }
});
redis.on('connect', () => console.log('[redis] connected'));