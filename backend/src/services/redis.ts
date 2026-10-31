import { Redis } from 'ioredis';

const url = process.env.REDIS_URL || 'redis://localhost:6379';

const isTLS = url.startsWith('rediss');

function createRedis(overrides = {}) {
  return new Redis(url, {
    ...(isTLS ? { tls: { rejectUnauthorized: true } } : {}),
    connectTimeout: 10000,
    keepAlive: 10000,
    retryStrategy: (times) => {
      if (times > 3) return null; // stop retrying after 3 attempts
      return Math.min(times * 500, 2000);
    },
    reconnectOnError: () => false,
    enableOfflineQueue: false,
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
redisForBull.on('error', () => {}); // Connection state is exposed by readiness checks.

export let queueRedisCompatible = false;
redisForBull.on('ready', async () => {
 try { const info = await redisForBull.info('server'); const version = /redis_version:(\d+)/.exec(info); queueRedisCompatible = !!version && Number(version[1]) >= 5; } catch { queueRedisCompatible = false; }
});
redisForBull.on('close', () => { queueRedisCompatible = false; });
