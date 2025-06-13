import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

import { RedisConfigRegistry } from './redis-config-registry.service';
import { RedisFeatureOptions } from '../interfaces';

@Injectable()
export class RedisConnectionManager implements OnModuleDestroy {
  private readonly connections = new Map<string, Redis>();
  private readonly connectionPromises = new Map<string, Promise<Redis>>();

  constructor(private readonly configRegistry: RedisConfigRegistry) {}

  async getConnection(options: RedisFeatureOptions): Promise<Redis> {
    // Validate configuration request
    this.configRegistry.validateFeatureRequest(options.configName);

    // Generate connection key based on final merged configuration
    // This enables connection sharing when final configs are identical
    const connectionKey = this.generateConnectionKey(options);

    // Return existing connection if available (connection sharing in action)
    if (this.connections.has(connectionKey)) {
      console.log(`♻️  Reusing existing Redis connection: ${connectionKey}`);
      return this.connections.get(connectionKey)!;
    }

    // Return existing promise if connection is being created
    if (this.connectionPromises.has(connectionKey)) {
      console.log(`⏳ Waiting for Redis connection creation: ${connectionKey}`);
      return this.connectionPromises.get(connectionKey)!;
    }

    // Create new connection
    console.log(`🔌 Creating new Redis connection: ${connectionKey}`);
    const connectionPromise = this.createConnection(options);
    this.connectionPromises.set(connectionKey, connectionPromise);

    try {
      const connection = await connectionPromise;
      this.connections.set(connectionKey, connection);
      this.connectionPromises.delete(connectionKey);
      console.log(`✅ Redis connection established: ${connectionKey}`);
      return connection;
    } catch (error) {
      this.connectionPromises.delete(connectionKey);
      console.error(`❌ Redis connection failed: ${connectionKey}`);
      throw error;
    }
  }

  private async createConnection(options: RedisFeatureOptions): Promise<Redis> {
    const baseConfig = this.configRegistry.getConfig(options.configName);

    // Extract Redis-specific options from flat config
    const { configName, retryAttempts, retryDelay, ...redisConfig } = baseConfig;

    // Feature config has highest priority - merge with feature overriding base
    const finalConfig: RedisOptions = {
      ...redisConfig,
      ...options.config,
    };

    const redis = new Redis(finalConfig);

    // Test connection with basic retry logic
    const maxRetries = retryAttempts || 3;
    const delayMs = retryDelay || 1000;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await redis.ping();
        break;
      } catch (error) {
        if (attempt === maxRetries) {
          throw new Error(`Failed to connect to Redis after ${maxRetries} attempts: ${error.message}`);
        }
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return redis;
  }

  /**
   * Generates a connection key based on the final merged Redis configuration.
   *
   * Connection sharing logic:
   * - If two features have identical final configs → they share the same connection
   * - If configs differ in any connection-relevant way → separate connections
   *
   * This approach optimizes resource usage while maintaining connection isolation
   * when needed (e.g., different databases, hosts, etc.)
   */
  private generateConnectionKey(options: RedisFeatureOptions): string {
    const baseConfig = this.configRegistry.getConfig(options.configName);

    // Extract Redis-specific options from flat config
    const { configName, retryAttempts, retryDelay, ...redisConfig } = baseConfig;

    // Create final merged config by combining base config with feature overrides
    const finalConfig = {
      ...redisConfig,
      ...options.config,
    };

    // Create a hash key based on connection-relevant properties
    // These are the properties that affect the actual Redis connection
    const connectionProperties = {
      host: finalConfig.host,
      port: finalConfig.port,
      db: finalConfig.db || 0,                    // Database number
      username: finalConfig.username,             // Auth username
      password: finalConfig.password ? '[PRESENT]' : undefined, // Don't expose password
      path: finalConfig.path,                     // Unix socket path (if used)
      family: finalConfig.family,                 // IP version (4 or 6)
      connectTimeout: finalConfig.connectTimeout, // Connection timeout
      lazyConnect: finalConfig.lazyConnect,       // Lazy connection flag
      // Note: keyPrefix is NOT included because it doesn't affect the connection
      // Multiple services can share the same connection with different keyPrefixes
    };

    // Sort keys for consistent hashing (order shouldn't matter)
    const sortedKeys = Object.keys(connectionProperties).sort();
    const sortedConfig: Record<string, any> = {};
    sortedKeys.forEach(key => {
      sortedConfig[key] = connectionProperties[key as keyof typeof connectionProperties];
    });

    // Generate hash of the connection properties
    const configHash = Buffer.from(JSON.stringify(sortedConfig)).toString('base64');

    // Return a readable connection key that includes the hash
    const configNamePart = options.configName || 'default';
    const featureName = options.name || 'default';

    // Format: configName_featureName_hash
    // This makes it easy to debug while ensuring uniqueness
    return `${configNamePart}_${featureName}_${configHash.substring(0, 8)}`;
  }

  /**
   * Get connection statistics for debugging and monitoring
   */
  getConnectionStats(): {
    totalConnections: number;
    activeConnections: string[];
    pendingConnections: string[];
  } {
    return {
      totalConnections: this.connections.size,
      activeConnections: Array.from(this.connections.keys()),
      pendingConnections: Array.from(this.connectionPromises.keys()),
    };
  }

  async onModuleDestroy() {
    console.log(`🔌 Closing ${this.connections.size} Redis connections...`);

    const disconnectionPromises = Array.from(this.connections.values()).map(
      (connection) => connection.quit(),
    );
    await Promise.all(disconnectionPromises);

    this.connections.clear();
    this.connectionPromises.clear();

    console.log('✅ All Redis connections closed');
  }
}