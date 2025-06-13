import { Injectable } from '@nestjs/common';

import { RedisModuleOptions } from '../interfaces';
import { DEFAULT_CONFIG_NAME } from '../constants';

@Injectable()
export class RedisConfigRegistry {
  private readonly configs = new Map<string, RedisModuleOptions>();

  registerConfig(config: RedisModuleOptions): void {
    const configName = config.configName || DEFAULT_CONFIG_NAME;

    // Apply default keyPrefix if not provided
    const finalConfig = { ...config };
    if (!finalConfig.keyPrefix && finalConfig.configName) {
      finalConfig.keyPrefix = `${finalConfig.configName}:`;
    }

    this.configs.set(configName, finalConfig);
  }

  registerConfigs(configs: RedisModuleOptions[]): void {
    // Validation: Check for multiple configs without names
    if (configs.length > 1) {
      const configsWithoutName = configs.filter(config => !config.configName);

      if (configsWithoutName.length > 1) {
        throw new Error(
          `Multiple Redis configurations provided without 'configName'. ` +
          `When using multiple configurations, each must have a unique 'configName'. ` +
          `Found ${configsWithoutName.length} configurations without names.`
        );
      }

      if (configsWithoutName.length === 1) {
        // Check if there are other configs that would conflict with 'default'
        const hasDefaultName = configs.some(config => config.configName === 'default');
        if (hasDefaultName) {
          throw new Error(
            `Configuration conflict: One config has no 'configName' (defaults to 'default') ` +
            `and another config explicitly uses configName: 'default'. ` +
            `Please use unique configName values for all configurations.`
          );
        }
      }
    }

    configs.forEach(config => this.registerConfig(config));
  }

  getConfig(configName?: string): RedisModuleOptions {
    const targetConfigName = configName || DEFAULT_CONFIG_NAME;

    // Smart defaults: if only one config exists and no specific name requested, use it
    if (!configName && this.configs.size === 1) {
      const [singleConfig] = this.configs.values();
      return singleConfig;
    }

    const config = this.configs.get(targetConfigName);

    if (!config) {
      const availableConfigs = Array.from(this.configs.keys());

      if (availableConfigs.length > 0) {
        throw new Error(
          `Redis config '${targetConfigName}' not found. Available configs: [${availableConfigs.map(c => `'${c}'`).join(', ')}].`
        );
      } else {
        throw new Error(
          `Redis config '${targetConfigName}' not found. No Redis configurations have been registered. Make sure to call forRoot() or forRootAsync() first.`
        );
      }
    }

    return config;
  }

  hasConfig(configName?: string): boolean {
    const targetConfigName = configName || DEFAULT_CONFIG_NAME;
    return this.configs.has(targetConfigName);
  }

  validateFeatureRequest(configName?: string): void {
    // If multiple configs exist and no specific config requested, require explicit selection
    if (!configName && this.configs.size > 1) {
      const availableConfigs = Array.from(this.configs.keys());
      throw new Error(
        `Multiple Redis configurations available: [${availableConfigs.map(c => `'${c}'`).join(', ')}]. ` +
        `Please specify 'configName' in forFeature() options to choose which configuration to use.`
      );
    }
  }
}