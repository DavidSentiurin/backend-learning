// redis.module.ts
import { DynamicModule, Module, Provider } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisCoreModule } from './redis-core.module';
import {
  RedisModuleOptions,
  RedisModuleAsyncOptions,
  RedisFeatureOptions,
  RedisFeatureAsyncOptions,
  RedisFeatureOptionsFactory,
} from './interfaces';
import { RedisConnectionManager, RedisService } from './services';
import { getRedisConnectionToken, getRedisServiceToken, DEFAULT_REDIS_CONNECTION, REDIS_SERVICE_TOKEN, REDIS_CONNECTION_TOKEN } from './constants';

@Module({})
export class RedisModule {
  static forRoot(options: RedisModuleOptions | RedisModuleOptions[]): DynamicModule {
    return {
      module: RedisModule,
      imports: [RedisCoreModule.forRoot(options)],
    };
  }

  static forRootAsync(options: RedisModuleAsyncOptions | RedisModuleAsyncOptions[]): DynamicModule {
    return {
      module: RedisModule,
      imports: [RedisCoreModule.forRootAsync(options)],
    };
  }

  static forFeature(options?: RedisFeatureOptions): DynamicModule {
    const featureOptions = options || { configName: 'default' };
    const connectionName = featureOptions.name || DEFAULT_REDIS_CONNECTION;

    // Lazy-loaded connection provider
    const connectionProvider: Provider = {
      provide: getRedisConnectionToken(connectionName),
      useFactory: async (connectionManager: RedisConnectionManager): Promise<Redis> => {
        // Connection is created only when first injected (lazy-loaded)
        return connectionManager.getConnection(featureOptions);
      },
      inject: [RedisConnectionManager],
    };

    const serviceProvider: Provider = {
      provide: getRedisServiceToken(connectionName),
      useFactory: (redis: Redis): RedisService => new RedisService(redis),
      inject: [getRedisConnectionToken(connectionName)],
    };

    // Add default providers for single config convenience
    const defaultProviders: Provider[] = [];

    // If this is the default connection, also provide it without name for convenience
    if (connectionName === DEFAULT_REDIS_CONNECTION) {
      defaultProviders.push(
        {
          provide: REDIS_CONNECTION_TOKEN,
          useExisting: getRedisConnectionToken(DEFAULT_REDIS_CONNECTION),
        },
        {
          provide: REDIS_SERVICE_TOKEN,
          useExisting: getRedisServiceToken(DEFAULT_REDIS_CONNECTION),
        }
      );
    }

    return {
      module: RedisModule,
      providers: [connectionProvider, serviceProvider, ...defaultProviders],
      exports: [connectionProvider, serviceProvider, ...defaultProviders],
    };
  }

  static forFeatureAsync(options: RedisFeatureAsyncOptions): DynamicModule {
    const connectionName = options.name || DEFAULT_REDIS_CONNECTION;

    const asyncOptionsProvider = this.createAsyncFeatureOptionsProvider(options);

    const connectionProvider: Provider = {
      provide: getRedisConnectionToken(connectionName),
      useFactory: async (
        connectionManager: RedisConnectionManager,
        featureOptions: RedisFeatureOptions,
      ): Promise<Redis> => {
        return connectionManager.getConnection(featureOptions);
      },
      inject: [RedisConnectionManager, (asyncOptionsProvider as Provider & { provide: string }).provide],
    };

    const serviceProvider: Provider = {
      provide: getRedisServiceToken(connectionName),
      useFactory: (redis: Redis): RedisService => new RedisService(redis),
      inject: [getRedisConnectionToken(connectionName)],
    };

    // Add default providers for single config convenience
    const defaultProviders: Provider[] = [];

    if (connectionName === DEFAULT_REDIS_CONNECTION) {
      defaultProviders.push(
        {
          provide: REDIS_CONNECTION_TOKEN,
          useExisting: getRedisConnectionToken(DEFAULT_REDIS_CONNECTION),
        },
        {
          provide: REDIS_SERVICE_TOKEN,
          useExisting: getRedisServiceToken(DEFAULT_REDIS_CONNECTION),
        }
      );
    }

    return {
      module: RedisModule,
      imports: options.imports || [],
      providers: [asyncOptionsProvider, connectionProvider, serviceProvider, ...defaultProviders],
      exports: [connectionProvider, serviceProvider, ...defaultProviders],
    };
  }

  private static createAsyncFeatureOptionsProvider(options: RedisFeatureAsyncOptions): Provider {
    const tokenName = `REDIS_FEATURE_OPTIONS_${options.name || 'default'}`;

    if (options.useFactory) {
      return {
        provide: tokenName,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    if (options.useClass) {
      return {
        provide: tokenName,
        useFactory: async (optionsFactory: RedisFeatureOptionsFactory): Promise<RedisFeatureOptions> =>
          await optionsFactory.createRedisFeatureOptions(),
        inject: [options.useClass],
      };
    }

    if (options.useExisting) {
      return {
        provide: tokenName,
        useFactory: async (optionsFactory: RedisFeatureOptionsFactory): Promise<RedisFeatureOptions> =>
          await optionsFactory.createRedisFeatureOptions(),
        inject: [options.useExisting],
      };
    }

    throw new Error('Invalid async feature options');
  }
}