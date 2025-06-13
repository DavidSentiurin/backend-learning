import { ModuleMetadata, Type } from '@nestjs/common';
import { RedisOptions } from 'ioredis';

export interface RedisModuleOptions extends RedisOptions {
  configName?: string;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface RedisOptionsFactory {
  createRedisOptions(): Promise<RedisModuleOptions> | RedisModuleOptions;
}

export interface RedisModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  configName?: string;
  useExisting?: Type<RedisOptionsFactory>;
  useClass?: Type<RedisOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<RedisModuleOptions> | RedisModuleOptions;
  inject?: any[];
}

// Feature-specific interfaces
export interface RedisFeatureOptions {
  name?: string;
  configName?: string;
  config?: Partial<RedisOptions>;
}

export interface RedisFeatureAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  configName?: string;
  useExisting?: Type<RedisFeatureOptionsFactory>;
  useClass?: Type<RedisFeatureOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<RedisFeatureOptions> | RedisFeatureOptions;
  inject?: any[];
}

export interface RedisFeatureOptionsFactory {
  createRedisFeatureOptions(): Promise<RedisFeatureOptions> | RedisFeatureOptions;
}