// redis.service.ts
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    private redis: Redis,
    private namespace: string
  ) {
    // Return a proxy that forwards all Redis methods
    return new Proxy(this, {
      get(target, prop) {
        // If it's our custom method or property, use it
        if (prop in target) {
          return target[prop];
        }

        // Otherwise, delegate to Redis instance
        const value = target.redis[prop];
        return typeof value === 'function' ? value.bind(target.redis) : value;
      },
    }) as RedisService & Redis;
  }

  // Expose namespace for debugging/logging
  getNamespace(): string {
    return this.namespace;
  }

  // Helper: JSON operations
  async setJson(key: string, value: any, ttl?: number): Promise<'OK'> {
    const json = JSON.stringify(value);
    return ttl ? this.redis.setex(key, ttl, json) : this.redis.set(key, json);
  }

  async getJson<T = any>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  // Helper: Cache-aside pattern
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = await this.getJson<T>(key);
    if (cached !== null) return cached;

    const value = await factory();
    await this.setJson(key, value, ttl);
    return value;
  }

  // Helper: Multiple operations
  async deletePattern(pattern: string): Promise<number> {
    const keys = await this.redis.keys(pattern);
    return keys.length > 0 ? this.redis.del(...keys) : 0;
  }

  // Helper: Clear all keys with this namespace
  async flushNamespace(): Promise<number> {
    return this.deletePattern(`${this.namespace}:*`);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}

// TypeScript magic to get all Redis methods
export interface RedisService extends Redis {}