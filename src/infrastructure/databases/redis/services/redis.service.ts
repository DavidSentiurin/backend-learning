import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  private overrides: Record<string, Function> = {};

  constructor(private redis: Redis) {
    // Define which methods to override with custom logic
    this.overrides = {
      // Add more method overrides here as needed
      // get: this.customGet.bind(this),
      // set: this.customSet.bind(this),
    };

    // Return a proxy that selectively overrides methods
    return new Proxy(redis, {
      get: (target, prop) => {
        // Use override if exists
        if (this.overrides[prop as string]) {
          return this.overrides[prop as string];
        }

        // Otherwise use original Redis method
        const value = Reflect.get(target, prop);
        return typeof value === 'function' ? value.bind(target) : value;
      }
    }) as RedisService & Redis;
  }

  // Example: Override get method with custom logic (commented out by default)
  // private async customGet(key: string): Promise<string | null> {
  //   // Add custom logic here (logging, monitoring, etc.)
  //   console.log(`Getting key: ${key}`);
  //   return this.redis.get(key);
  // }

  // Example: Override set method with custom logic (commented out by default)
  // private async customSet(key: string, value: string, ttl?: number): Promise<'OK'> {
  //   // Add custom logic here (validation, logging, etc.)
  //   console.log(`Setting key: ${key}`);
  //   if (ttl) {
  //     return this.redis.setex(key, ttl, value);
  //   }
  //   return this.redis.set(key, value);
  // }

  // Get the underlying Redis client for advanced operations
  getClient(): Redis {
    return this.redis;
  }
}

// TypeScript interface to ensure RedisService has all Redis methods
// This makes all Redis methods available with proper typing
export interface RedisService extends Redis {
  // Custom method signatures
  getClient(): Redis;
}