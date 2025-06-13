export const REDIS_MODULE_OPTIONS = 'REDIS_MODULE_OPTIONS';
export const REDIS_CONFIG_REGISTRY = 'REDIS_CONFIG_REGISTRY';
export const REDIS_CONNECTION_TOKEN = 'REDIS_CONNECTION';
export const REDIS_SERVICE_TOKEN = 'REDIS_SERVICE';
export const DEFAULT_REDIS_CONNECTION = 'default';
export const DEFAULT_CONFIG_NAME = 'default';

export const getRedisConnectionToken = (name?: string): string => {
  return name && name !== DEFAULT_REDIS_CONNECTION
    ? `${REDIS_CONNECTION_TOKEN}_${name}`
    : REDIS_CONNECTION_TOKEN;
};

export const getRedisServiceToken = (name?: string): string => {
  return name && name !== DEFAULT_REDIS_CONNECTION
    ? `${REDIS_SERVICE_TOKEN}_${name}`
    : REDIS_SERVICE_TOKEN;
};