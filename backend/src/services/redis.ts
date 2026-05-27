import { Redis } from 'ioredis';

const url = process.env.REDIS_URL || 'redis://localhost:6379';

const tlsConfig = url.startsWith('rediss') ? { tls: {} } : {};

export const redis = new Redis(url, {
  ...tlsConfig,
});

export const redisForBull = new Redis(url, {
  maxRetriesPerRequest: null,
  ...tlsConfig,
});