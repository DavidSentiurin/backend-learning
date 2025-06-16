import { DynamicModule, Module, Provider, Inject, Type } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisService, RedisConnectionManager } from './services';
import {
  RedisModuleOptions,
  RedisModuleAsyncOptions,
  RedisOptionsFactory,
} from './interfaces';
import {
  REDIS_BASE_OPTIONS,
  createServiceToken,
  createRedisToken,
} from './constants';
import { LoggerService } from '../../../utils/logger';

@Module({})
export class RedisModule {
  static forRoot(options: RedisModuleOptions): DynamicModule {
    const baseOptionsProvider: Provider = {
      provide: REDIS_BASE_OPTIONS,
      useValue: options,
    };

    const connectionManagerProvider: Provider = {
      provide: RedisConnectionManager,
      useClass: RedisConnectionManager,
    };

    return {
      module: RedisModule,
      global: true,
      providers: [
        baseOptionsProvider,
        connectionManagerProvider,
        LoggerService,
      ],
      exports: [REDIS_BASE_OPTIONS, RedisConnectionManager],
    };
  }

  static forRootAsync(options: RedisModuleAsyncOptions): DynamicModule {
    const asyncProviders = this.createAsyncProviders(options);

    const connectionManagerProvider: Provider = {
      provide: RedisConnectionManager,
      useClass: RedisConnectionManager,
    };

    return {
      module: RedisModule,
      global: true,
      imports: options.imports || [],
      providers: [...asyncProviders, connectionManagerProvider, LoggerService],
      exports: [REDIS_BASE_OPTIONS, RedisConnectionManager],
    };
  }

  static forFeature(
    prefix: string,
    overrides?: Partial<RedisModuleOptions>,
  ): DynamicModule & {
    RedisService: Type<RedisService>;
    Redis: Type<Redis>;
    injectRedis: () => ParameterDecorator;
    injectRedisService: () => ParameterDecorator;
  } {
    // Create unique tokens for this feature
    const redisToken = createRedisToken(prefix);
    const serviceToken = createServiceToken(prefix);

    // Create Redis connection for this feature
    const redisProvider: Provider = {
      provide: redisToken,
      useFactory: async (
        baseOptions: RedisModuleOptions,
        connectionManager: RedisConnectionManager,
      ): Promise<Redis> => {
        const finalOptions = {
          ...baseOptions,
          ...overrides,
          keyPrefix: `${prefix}:`,
        };

        // Use connection manager for sharing
        return connectionManager.getConnection(finalOptions);
      },
      inject: [REDIS_BASE_OPTIONS, RedisConnectionManager],
    };

    // Create RedisService for this feature
    const serviceProvider: Provider = {
      provide: serviceToken,
      useFactory: (redis: Redis): RedisService =>
        new RedisService(redis, prefix),
      inject: [redisToken],
    };

    // For single forFeature usage - provide as default RedisService
    const defaultProviders: Provider[] = [
      {
        provide: RedisService,
        useExisting: serviceToken,
      },
      {
        provide: Redis,
        useExisting: redisToken,
      },
    ];

    const module: DynamicModule = {
      module: RedisModule,
      providers: [redisProvider, serviceProvider, ...defaultProviders],
      exports: [serviceToken, redisToken, RedisService, Redis],
    };

    // Return module with helper properties
    return Object.assign(module, {
      // These are for TypeScript type inference
      RedisService: RedisService as Type<RedisService>,
      Redis: Redis as Type<Redis>,
      // Injection helpers for multiple instances
      injectRedis: () => Inject(redisToken),
      injectRedisService: () => Inject(serviceToken),
    });
  }

  static forFeatureAsync(
    prefix: string,
    optionsFactory: () => Promise<Partial<RedisModuleOptions>>,
  ): DynamicModule & {
    RedisService: Type<RedisService>;
    Redis: Type<Redis>;
    injectRedis: () => ParameterDecorator;
    injectRedisService: () => ParameterDecorator;
  } {
    const redisToken = createRedisToken(prefix);
    const serviceToken = createServiceToken(prefix);

    const redisProvider: Provider = {
      provide: redisToken,
      useFactory: async (
        baseOptions: RedisModuleOptions,
        connectionManager: RedisConnectionManager,
      ): Promise<Redis> => {
        const overrides = await optionsFactory();
        const finalOptions = {
          ...baseOptions,
          ...overrides,
          keyPrefix: `${prefix}:`,
        };

        return connectionManager.getConnection(finalOptions);
      },
      inject: [REDIS_BASE_OPTIONS, RedisConnectionManager],
    };

    const serviceProvider: Provider = {
      provide: serviceToken,
      useFactory: (redis: Redis): RedisService =>
        new RedisService(redis, prefix),
      inject: [redisToken],
    };

    const defaultProviders: Provider[] = [
      {
        provide: RedisService,
        useExisting: serviceToken,
      },
      {
        provide: Redis,
        useExisting: redisToken,
      },
    ];

    const module: DynamicModule = {
      module: RedisModule,
      providers: [redisProvider, serviceProvider, ...defaultProviders],
      exports: [serviceToken, redisToken, RedisService, Redis],
    };

    return Object.assign(module, {
      RedisService: RedisService as Type<RedisService>,
      Redis: Redis as Type<Redis>,
      injectRedis: () => Inject(redisToken),
      injectRedisService: () => Inject(serviceToken),
    });
  }

  private static createAsyncProviders(
    options: RedisModuleAsyncOptions,
  ): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: REDIS_BASE_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
      ];
    }

    if (options.useClass) {
      return [
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
        {
          provide: REDIS_BASE_OPTIONS,
          useFactory: async (
            optionsFactory: RedisOptionsFactory,
          ): Promise<RedisModuleOptions> =>
            await optionsFactory.createRedisOptions(),
          inject: [options.useClass],
        },
      ];
    }

    if (options.useExisting) {
      return [
        {
          provide: REDIS_BASE_OPTIONS,
          useFactory: async (
            optionsFactory: RedisOptionsFactory,
          ): Promise<RedisModuleOptions> =>
            await optionsFactory.createRedisOptions(),
          inject: [options.useExisting],
        },
      ];
    }

    throw new Error('Invalid async options');
  }
}
