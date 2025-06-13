import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import {
  RedisModuleOptions,
  RedisModuleAsyncOptions,
  RedisOptionsFactory,
} from './interfaces';
import { REDIS_CONFIG_REGISTRY } from './constants';
import { RedisConfigRegistry, RedisConnectionManager } from './services';

@Global()
@Module({})
export class RedisCoreModule {
  static forRoot(options: RedisModuleOptions | RedisModuleOptions[]): DynamicModule {
    const optionsArray = Array.isArray(options) ? options : [options];

    const configRegistryProvider: Provider = {
      provide: REDIS_CONFIG_REGISTRY,
      useFactory: (): RedisConfigRegistry => {
        const registry = new RedisConfigRegistry();
        registry.registerConfigs(optionsArray);
        return registry;
      },
    };

    return {
      module: RedisCoreModule,
      providers: [
        configRegistryProvider,
        {
          provide: RedisConfigRegistry,
          useExisting: REDIS_CONFIG_REGISTRY,
        },
        RedisConnectionManager,
      ],
      exports: [RedisConfigRegistry, RedisConnectionManager],
    };
  }

  static forRootAsync(options: RedisModuleAsyncOptions | RedisModuleAsyncOptions[]): DynamicModule {
    const optionsArray = Array.isArray(options) ? options : [options];

    // Validate async options structure
    this.validateAsyncOptions(optionsArray);

    const asyncProviders = optionsArray.map((option) =>
      this.createAsyncOptionsProvider(option),
    );

    const configRegistryProvider: Provider = {
      provide: REDIS_CONFIG_REGISTRY,
      useFactory: (...configs: RedisModuleOptions[]): RedisConfigRegistry => {
        const registry = new RedisConfigRegistry();
        // Validation happens here after all async factories have resolved
        registry.registerConfigs(configs);
        return registry;
      },
      inject: asyncProviders.map((provider) => (provider as Provider & { provide: string }).provide),
    };

    const allImports = optionsArray
      .map(option => option.imports || [])
      .reduce((acc, imports) => [...acc, ...imports], []);

    return {
      module: RedisCoreModule,
      imports: allImports,
      providers: [
        ...asyncProviders,
        configRegistryProvider,
        {
          provide: RedisConfigRegistry,
          useExisting: REDIS_CONFIG_REGISTRY,
        },
        RedisConnectionManager,
      ],
      exports: [RedisConfigRegistry, RedisConnectionManager],
    };
  }

  private static validateAsyncOptions(optionsArray: RedisModuleAsyncOptions[]): void {
    if (optionsArray.length > 1) {
      const optionsWithoutName = optionsArray.filter(option => !option.configName);

      if (optionsWithoutName.length > 1) {
        throw new Error(
          `Multiple Redis async configurations provided without 'configName'. ` +
          `When using multiple async configurations, each must have a unique 'configName'. ` +
          `Found ${optionsWithoutName.length} configurations without names.`
        );
      }

      if (optionsWithoutName.length === 1) {
        const hasDefaultName = optionsArray.some(option => option.configName === 'default');
        if (hasDefaultName) {
          throw new Error(
            `Async configuration conflict: One config has no 'configName' (defaults to 'default') ` +
            `and another config explicitly uses configName: 'default'. ` +
            `Please use unique configName values for all configurations.`
          );
        }
      }
    }
  }

  private static createAsyncOptionsProvider(options: RedisModuleAsyncOptions): Provider {
    const tokenName = `REDIS_MODULE_OPTIONS_${options.configName || 'default'}`;

    if (options.useFactory) {
      return {
        provide: tokenName,
        useFactory: async (...args: any[]): Promise<RedisModuleOptions> => {
          const config = await options.useFactory!(...args);
          // Ensure configName is set from the async options
          return {
            ...config,
            configName: options.configName || config.configName,
          };
        },
        inject: options.inject || [],
      };
    }

    if (options.useClass) {
      return {
        provide: tokenName,
        useFactory: async (optionsFactory: RedisOptionsFactory): Promise<RedisModuleOptions> => {
          const config = await optionsFactory.createRedisOptions();
          return {
            ...config,
            configName: options.configName || config.configName,
          };
        },
        inject: [options.useClass],
      };
    }

    if (options.useExisting) {
      return {
        provide: tokenName,
        useFactory: async (optionsFactory: RedisOptionsFactory): Promise<RedisModuleOptions> => {
          const config = await optionsFactory.createRedisOptions();
          return {
            ...config,
            configName: options.configName || config.configName,
          };
        },
        inject: [options.useExisting],
      };
    }

    throw new Error('Invalid async options');
  }
}