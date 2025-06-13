import { Inject } from '@nestjs/common'
  ;
import { getRedisConnectionToken, getRedisServiceToken, REDIS_CONNECTION_TOKEN, REDIS_SERVICE_TOKEN } from '../constants';

export const InjectRedis = (name?: string) => {
  // If no name provided, use the default token for single config convenience
  if (!name) {
    return Inject(REDIS_CONNECTION_TOKEN);
  }
  return Inject(getRedisConnectionToken(name));
};

export const InjectRedisService = (name?: string) => {
  // If no name provided, use the default token for single config convenience
  if (!name) {
    return Inject(REDIS_SERVICE_TOKEN);
  }
  return Inject(getRedisServiceToken(name));
};