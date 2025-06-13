import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisModuleOptions } from '../interfaces';

@Injectable()
export class RedisConnectionManager implements OnModuleDestroy {
  private readonly logger = new Logger(RedisConnectionManager.name);
  private readonly connections = new Map<string, Redis>();
  private readonly connectionRefs = new Map<string, number>();

  async getConnection(options: RedisModuleOptions): Promise<Redis> {
    const connectionKey = this.getConnectionKey(options);

    // Check if connection already exists
    if (this.connections.has(connectionKey)) {
      const refs = this.connectionRefs.get(connectionKey) || 0;
      this.connectionRefs.set(connectionKey, refs + 1);

      this.logger.debug(
        `Reusing Redis connection: ${connectionKey} (refs: ${refs + 1})`
      );

      return this.connections.get(connectionKey)!;
    }

    // Create new connection
    this.logger.log(`Creating new Redis connection: ${connectionKey}`);

    const redis = new Redis(options);

    // Test connection
    try {
      await redis.ping();
    } catch (error) {
      this.logger.error(`Failed to connect to Redis: ${error.message}`);
      throw error;
    }

    this.connections.set(connectionKey, redis);
    this.connectionRefs.set(connectionKey, 1);

    this.logger.log(
      `Redis connection established: ${connectionKey} (Total connections: ${this.connections.size})`
    );

    return redis;
  }

  private getConnectionKey(options: RedisModuleOptions): string {
    // Extract connection-specific options (exclude keyPrefix as it doesn't affect connection)
    const {
      keyPrefix,
      retryAttempts,
      retryDelay,
      ...connectionOptions
    } = options;

    // Sort keys for consistent hashing
    const sorted = Object.keys(connectionOptions)
      .sort()
      .reduce((acc, key) => {
        acc[key] = connectionOptions[key];
        return acc;
      }, {} as any);

    return JSON.stringify(sorted);
  }

  getConnectionStats() {
    const stats = Array.from(this.connections.entries()).map(([key, redis]) => ({
      key,
      refs: this.connectionRefs.get(key) || 0,
      // @ts-ignore - accessing private property for debugging
      status: redis.status || 'unknown',
    }));

    return {
      total: this.connections.size,
      connections: stats,
    };
  }

  async onModuleDestroy() {
    this.logger.log(`Closing ${this.connections.size} Redis connections...`);

    const closePromises = Array.from(this.connections.values()).map(redis =>
      redis.quit().catch(err =>
        this.logger.error(`Error closing Redis connection: ${err.message}`)
      )
    );

    await Promise.all(closePromises);

    this.connections.clear();
    this.connectionRefs.clear();

    this.logger.log('All Redis connections closed');
  }
}
