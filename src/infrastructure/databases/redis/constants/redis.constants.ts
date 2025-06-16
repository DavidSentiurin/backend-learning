export const REDIS_BASE_OPTIONS = 'REDIS_BASE_OPTIONS';

// Create unique tokens based on prefix
export const createRedisToken = (prefix: string) =>
  `REDIS_${prefix.toUpperCase()}`;
export const createServiceToken = (prefix: string) =>
  `REDIS_SERVICE_${prefix.toUpperCase()}`;
