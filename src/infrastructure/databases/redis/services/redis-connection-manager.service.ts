import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

import { RedisModuleOptions } from '../interfaces';
import { LoggerService } from '../../../../utils/logger';
import { omit } from 'lodash';

interface ConnectionStats {
  key: string;
  refs: number;
  status: string;
}

@Injectable()
export class RedisConnectionManager implements OnModuleDestroy {
  private readonly logger: LoggerService;

  constructor(private readonly loggerService: LoggerService) {
    this.logger = loggerService.createContext('REDIS');
  }

  private readonly connections = new Map<string, Redis>();
  private readonly connectionRefs = new Map<string, number>();

  async getConnection(options: RedisModuleOptions): Promise<Redis> {
    const connectionKey = this.getConnectionKey(options);

    // Check if connection already exists
    if (this.connections.has(connectionKey)) {
      const refs = this.connectionRefs.get(connectionKey) || 0;
      this.connectionRefs.set(connectionKey, refs + 1);

      this.logger.debug(
        `Reusing Redis connection: ${connectionKey} (refs: ${refs + 1})`,
      );

      const existingConnection = this.connections.get(connectionKey);
      if (!existingConnection) {
        throw new Error('Connection not found in map');
      }
      return existingConnection;
    }

    // Create new connection
    this.logger.log(`Creating new Redis connection: ${connectionKey}`);

    const redis = new Redis(options);

    // Test connection
    try {
      await redis.ping();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to connect to Redis: ${errorMessage}`);
      throw error;
    }

    this.connections.set(connectionKey, redis);
    this.connectionRefs.set(connectionKey, 1);

    this.logger.log(
      `Redis connection established: ${connectionKey} (Total connections: ${this.connections.size})`,
    );

    return redis;
  }

  private getConnectionKey(options: RedisModuleOptions): string {
    // Extract connection-specific options (exclude keyPrefix as it doesn't affect connection)
    const connectionOptions = omit(options, [
      'keyPrefix',
      'retryAttempts',
      'retryDelay',
    ]);

    // Create a serializable version of connection options
    const serializableOptions: Record<string, unknown> = {};

    Object.keys(connectionOptions).forEach((key) => {
      const typedKey = key as keyof typeof connectionOptions;
      const value = connectionOptions[typedKey];
      // Convert functions and complex objects to strings for consistent hashing
      if (typeof value === 'function') {
        serializableOptions[key] = value.toString();
      } else if (value !== undefined) {
        serializableOptions[key] = value;
      }
    });

    // Sort keys for consistent hashing
    const sortedKeys = Object.keys(serializableOptions).sort();
    const sorted: Record<string, unknown> = {};

    sortedKeys.forEach((key) => {
      sorted[key] = serializableOptions[key];
    });

    return JSON.stringify(sorted);
  }

  getConnectionStats(): { total: number; connections: ConnectionStats[] } {
    const stats = Array.from(this.connections.entries()).map(
      ([key, redis]) => ({
        key,
        refs: this.connectionRefs.get(key) || 0,
        status: (redis as Redis & { status?: string }).status || 'unknown',
      }),
    );

    return {
      total: this.connections.size,
      connections: stats,
    };
  }

  async onModuleDestroy(): Promise<void> {
    this.logger.log(`Closing ${this.connections.size} Redis connections...`);

    const closePromises = Array.from(this.connections.values()).map((redis) =>
      redis.quit().catch((err) => {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        this.logger.error(`Error closing Redis connection: ${errorMessage}`);
      }),
    );

    await Promise.all(closePromises);

    this.connections.clear();
    this.connectionRefs.clear();

    this.logger.log('All Redis connections closed');
  }
}
