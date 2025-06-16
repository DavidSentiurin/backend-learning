import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;
  private readonly namespace: string;

  constructor(redis: Redis, namespace: string) {
    this.redis = redis;
    this.namespace = namespace;
  }

  // Expose the Redis instance for direct access when needed
  getRedisInstance(): Redis {
    return this.redis;
  }

  // Expose namespace for debugging/logging
  getNamespace(): string {
    return this.namespace;
  }

  // Forward common Redis methods with proper typing
  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async set(key: string, value: string): Promise<'OK'> {
    return this.redis.set(key, value);
  }

  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    return this.redis.setex(key, seconds, value);
  }

  async del(...keys: string[]): Promise<number> {
    return this.redis.del(...keys);
  }

  async exists(...keys: string[]): Promise<number> {
    return this.redis.exists(...keys);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.redis.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.redis.keys(pattern);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.redis.hget(key, field);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return this.redis.hset(key, field, value);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.redis.hgetall(key);
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    return this.redis.lpush(key, ...values);
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    return this.redis.rpush(key, ...values);
  }

  async lpop(key: string): Promise<string | null> {
    return this.redis.lpop(key);
  }

  async rpop(key: string): Promise<string | null> {
    return this.redis.rpop(key);
  }

  async ltrim(key: string, start: number, stop: number): Promise<'OK'> {
    return this.redis.ltrim(key, start, stop);
  }

  async ping(): Promise<'PONG'> {
    return this.redis.ping();
  }

  // Helper: JSON operations
  async setJson(key: string, value: unknown, ttl?: number): Promise<'OK'> {
    const json = JSON.stringify(value);
    return ttl ? this.redis.setex(key, ttl, json) : this.redis.set(key, json);
  }

  async getJson<T = unknown>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  // Helper: Cache-aside pattern
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number,
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

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
