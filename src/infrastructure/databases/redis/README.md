# NestJS Redis Module

A production-ready, TypeScript-first Redis integration for NestJS applications with automatic key prefixing, connection management, and feature-based module support.

## 🌟 Features

- 🚀 **Zero Configuration** - Works out of the box with sensible defaults
- 🏷️ **Automatic Key Prefixing** - Built-in namespace isolation for different features
- 🔗 **Connection Sharing** - Intelligent connection pooling and reuse
- 🧠 **Smart Configuration** - Async configuration support with environment variables
- ⚡ **High Performance** - Optimized connection management with reference counting
- 🔧 **TypeScript First** - Full type safety and IntelliSense support
- 🎯 **Feature Modules** - Easy integration with feature-based architecture
- 📊 **Connection Stats** - Built-in monitoring and debugging capabilities

## 📦 Installation

```bash
npm install ioredis
# or
yarn add ioredis
```

```bash
# Install type definitions
npm install --save-dev @types/ioredis
```

## 🚀 Quick Start

### 1. Basic Setup

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from './infrastructure/databases';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get('REDIS_PORT', 6379),
        password: configService.get('REDIS_PASSWORD'),
        db: configService.get('REDIS_DB', 0),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### 2. Feature Module Integration

```typescript
// session/session.module.ts
import { Module } from '@nestjs/common';
import { RedisModule } from '../../infrastructure/databases';

@Module({
  imports: [
    RedisModule.forFeature('session'), // Keys prefixed with 'session:'
  ],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
```

### 3. Using Redis in Services

```typescript
// session/session.service.ts
import { Injectable } from '@nestjs/common';
import { RedisService } from '../../infrastructure/databases';

@Injectable()
export class SessionService {
  constructor(private readonly redis: RedisService) {}

  async set(key: string, value: string, expiration: number) {
    // Automatically prefixed as 'session:key'
    return this.redis.setex(key, expiration, value);
  }

  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async delete(key: string): Promise<number> {
    return this.redis.del(key);
  }
}
```

## 🏗️ Architecture

### Module Structure

```
src/infrastructure/databases/redis/
├── constants/
│   ├── redis.constants.ts       # Token generators and constants
│   └── index.ts
├── interfaces/
│   ├── redis-options.interface.ts
│   ├── query-runner-factory.interface.ts
│   └── index.ts
├── services/
│   ├── redis.service.ts         # Main Redis service wrapper
│   ├── redis-connection-manager.service.ts  # Connection pooling
│   └── index.ts
├── redis.module.ts              # Main module with factory methods
└── index.ts
```

### Core Components

#### 1. RedisModule

The main module providing factory methods for different configuration patterns:

- `forRoot()` - Basic synchronous configuration
- `forRootAsync()` - Async configuration with dependency injection
- `forFeature()` - Feature-specific Redis instances with prefixing

#### 2. RedisConnectionManager

Handles connection pooling and sharing:

- **Connection Reuse**: Identical configurations share connections
- **Reference Counting**: Tracks connection usage
- **Automatic Cleanup**: Properly closes connections on module destroy
- **Error Handling**: Robust error handling with detailed logging

#### 3. RedisService

Type-safe wrapper around ioredis with additional utilities:

- **Common Redis Methods**: All frequently used Redis operations
- **JSON Helpers**: Built-in JSON serialization/deserialization
- **Cache Patterns**: Helper methods for common caching patterns
- **Direct Access**: Access to underlying Redis instance when needed

## 📚 Configuration Options

### Basic Configuration

```typescript
interface RedisModuleOptions extends RedisOptions {
  retryAttempts?: number;
  retryDelay?: number;
}
```

### Synchronous Configuration

```typescript
RedisModule.forRoot({
  host: 'localhost',
  port: 6379,
  password: 'your-password',
  db: 0,
  retryAttempts: 3,
  retryDelay: 1000,
});
```

### Async Configuration

```typescript
RedisModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    host: configService.get('REDIS_HOST'),
    port: configService.get('REDIS_PORT'),
    password: configService.get('REDIS_PASSWORD'),
    db: configService.get('REDIS_DB', 0),
  }),
  inject: [ConfigService],
});
```

## 🎯 Feature Integration Patterns

### 1. Session Management

```typescript
// modules/session/session.module.ts
@Module({
  imports: [RedisModule.forFeature('session')],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}

// modules/session/session.service.ts
@Injectable()
export class SessionService {
  constructor(private readonly redis: RedisService) {}

  async createSession(userId: string, data: any): Promise<string> {
    const sessionId = generateId();
    await this.redis.setJson(`user:${userId}`, data, 3600);
    return sessionId;
  }
}
```

### 2. Authentication Sessions

```typescript
// modules/auth/auth-session.service.ts
@Injectable()
export class AuthSessionService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly authUtil: AuthUtil,
  ) {}

  private getAuthSessionKey = (userId: string): string => `auth:${userId}`;

  async set(userId: string, accessToken: string): Promise<void> {
    const expiration = this.authUtil.getAccessTokenExpiration();
    const key = this.getAuthSessionKey(userId);
    await this.sessionService.set(key, accessToken, expiration);
  }

  async get(userId: string): Promise<string | null> {
    const key = this.getAuthSessionKey(userId);
    return this.sessionService.get(key);
  }
}
```

### 3. Caching Layer

```typescript
// modules/cache/cache.service.ts
@Injectable()
export class CacheService {
  constructor(private readonly redis: RedisService) {}

  async cacheWithFallback<T>(
    key: string,
    fallbackFn: () => Promise<T>,
    ttl: number = 3600,
  ): Promise<T> {
    return this.redis.getOrSet(key, fallbackFn, ttl);
  }

  async invalidatePattern(pattern: string): Promise<number> {
    return this.redis.deletePattern(pattern);
  }
}
```

## 🔧 Advanced Usage

### Connection Sharing

Connections with identical configurations are automatically shared:

```typescript
// These will share the same connection
RedisModule.forFeature('cache'); // connection-1
RedisModule.forFeature('session'); // connection-1 (same base config)

// Different configuration = new connection
RedisModule.forFeature('queue', { db: 1 }); // connection-2
```

### Multiple Redis Instances in One Module

Sometimes you need multiple Redis instances within a single module (e.g., separate cache and session stores):

```typescript
// analytics.module.ts
@Module({
  imports: [
    // Import multiple Redis features
    RedisModule.forFeature('analytics-cache', { db: 0 }),
    RedisModule.forFeature('analytics-session', { db: 1 }),
  ],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
```

#### Method 1: Using Injection Tokens

```typescript
// analytics.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { RedisService } from '../../infrastructure/databases';
import { createServiceToken } from '../../infrastructure/databases/redis/constants';

@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(createServiceToken('analytics-cache'))
    private readonly cacheRedis: RedisService,

    @Inject(createServiceToken('analytics-session'))
    private readonly sessionRedis: RedisService,
  ) {}

  async cacheAnalytics(userId: string, data: any): Promise<void> {
    // Uses analytics-cache: prefix (db: 0)
    await this.cacheRedis.setJson(`user:${userId}`, data, 3600);
  }

  async trackSession(sessionId: string, events: any[]): Promise<void> {
    // Uses analytics-session: prefix (db: 1)
    await this.sessionRedis.setJson(`session:${sessionId}`, events, 7200);
  }

  async getAnalyticsSummary(userId: string): Promise<any> {
    // Combine data from both Redis instances
    const [cachedData, sessionData] = await Promise.all([
      this.cacheRedis.getJson(`user:${userId}`),
      this.sessionRedis.getJson(`session:${userId}`),
    ]);

    return { cachedData, sessionData };
  }
}
```

#### Method 2: Using Custom Providers with Descriptive Names

```typescript
// analytics.module.ts
@Module({
  imports: [
    RedisModule.forFeature('analytics-cache', { db: 0 }),
    RedisModule.forFeature('analytics-session', { db: 1 }),
  ],
  providers: [
    AnalyticsService,
    // Create custom provider aliases for better readability
    {
      provide: 'CACHE_REDIS',
      useExisting: createServiceToken('analytics-cache'),
    },
    {
      provide: 'SESSION_REDIS',
      useExisting: createServiceToken('analytics-session'),
    },
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

// analytics.service.ts
@Injectable()
export class AnalyticsService {
  constructor(
    @Inject('CACHE_REDIS') private readonly cacheRedis: RedisService,
    @Inject('SESSION_REDIS') private readonly sessionRedis: RedisService,
  ) {}

  // Same implementation as above...
}
```

#### Method 3: Service Factory Pattern (Most Flexible)

```typescript
// analytics.module.ts
@Module({
  imports: [
    RedisModule.forFeature('analytics-cache', { db: 0 }),
    RedisModule.forFeature('analytics-session', { db: 1 }),
  ],
  providers: [
    {
      provide: AnalyticsService,
      useFactory: (cacheRedis: RedisService, sessionRedis: RedisService) => {
        return new AnalyticsService(cacheRedis, sessionRedis);
      },
      inject: [
        createServiceToken('analytics-cache'),
        createServiceToken('analytics-session'),
      ],
    },
  ],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
```

#### Real-World Example: E-commerce Module

```typescript
// ecommerce.module.ts
@Module({
  imports: [
    // Product cache - fast access, short TTL
    RedisModule.forFeature('product-cache', {
      db: 0,
      maxRetriesPerRequest: 3,
    }),

    // User sessions - persistent, longer TTL
    RedisModule.forFeature('user-session', {
      db: 1,
      maxRetriesPerRequest: 5,
    }),

    // Shopping cart - temporary, medium TTL
    RedisModule.forFeature('shopping-cart', {
      db: 2,
      keyPrefix: 'cart:', // Custom prefix override
    }),
  ],
  providers: [EcommerceService],
  exports: [EcommerceService],
})
export class EcommerceModule {}

// ecommerce.service.ts
@Injectable()
export class EcommerceService {
  constructor(
    @Inject(createServiceToken('product-cache'))
    private readonly productCache: RedisService,

    @Inject(createServiceToken('user-session'))
    private readonly userSession: RedisService,

    @Inject(createServiceToken('shopping-cart'))
    private readonly cartRedis: RedisService,
  ) {}

  async cacheProduct(productId: string, product: Product): Promise<void> {
    // Fast product cache: product-cache:product:123
    await this.productCache.setJson(`product:${productId}`, product, 300);
  }

  async createUserSession(userId: string, sessionData: any): Promise<string> {
    const sessionId = generateSessionId();
    // User session: user-session:user:456:session:abc123
    await this.userSession.setJson(
      `user:${userId}:session:${sessionId}`,
      sessionData,
      86400,
    );
    return sessionId;
  }

  async addToCart(userId: string, item: CartItem): Promise<void> {
    // Shopping cart: cart:cart:user:789 (note: custom prefix override)
    const cartKey = `cart:user:${userId}`;
    const currentCart =
      (await this.cartRedis.getJson<CartItem[]>(cartKey)) || [];
    currentCart.push(item);
    await this.cartRedis.setJson(cartKey, currentCart, 3600);
  }

  async getProductWithCache(productId: string): Promise<Product> {
    // Try cache first, fallback to database
    return this.productCache.getOrSet(
      `product:${productId}`,
      () => this.productRepository.findById(productId),
      300,
    );
  }

  async clearUserData(userId: string): Promise<void> {
    // Clean up across all Redis instances
    await Promise.all([
      this.userSession.deletePattern(`user:${userId}:*`),
      this.cartRedis.del(`cart:user:${userId}`),
      // Note: Product cache is shared, so we don't clear it
    ]);
  }
}
```

#### Connection Sharing Behavior

```typescript
// These share connections (same configuration fingerprint):
RedisModule.forFeature('cache', { host: 'localhost', port: 6379, db: 0 });
RedisModule.forFeature('temp', { host: 'localhost', port: 6379, db: 0 });
// Result: 1 connection, 2 prefixes (cache:, temp:)

// These get separate connections (different db):
RedisModule.forFeature('sessions', { host: 'localhost', port: 6379, db: 1 });
RedisModule.forFeature('analytics', { host: 'localhost', port: 6379, db: 2 });
// Result: 2 connections with different databases
```

#### Best Practices for Multiple Instances

1. **Use Descriptive Prefixes**

   ```typescript
   // ✅ Good - clear purpose
   RedisModule.forFeature('user-session');
   RedisModule.forFeature('product-cache');
   RedisModule.forFeature('email-queue');

   // ❌ Avoid - unclear purpose
   RedisModule.forFeature('redis1');
   RedisModule.forFeature('cache2');
   ```

2. **Organize by Data Lifecycle**

   ```typescript
   // Short-lived cache
   RedisModule.forFeature('api-cache', { db: 0 });

   // Medium-lived sessions
   RedisModule.forFeature('user-session', { db: 1 });

   // Long-lived application data
   RedisModule.forFeature('app-state', { db: 2 });
   ```

3. **Use Custom Providers for Complex Scenarios**
   ```typescript
   @Module({
     imports: [/* Redis features */],
     providers: [
       {
         provide: 'MULTI_REDIS_SERVICE',
         useFactory: (cache, session, queue) => ({
           cache,
           session,
           queue,
         }),
         inject: [
           createServiceToken('cache'),
           createServiceToken('session'),
           createServiceToken('queue'),
         ],
       },
     ],
   })
   ```

### Direct Redis Access

When you need full Redis functionality:

```typescript
@Injectable()
export class AdvancedService {
  constructor(private readonly redis: RedisService) {}

  async complexOperation(): Promise<void> {
    const redisInstance = this.redis.getRedisInstance();

    // Use full Redis API
    const pipeline = redisInstance.pipeline();
    pipeline.set('key1', 'value1');
    pipeline.set('key2', 'value2');
    pipeline.expire('key1', 3600);

    await pipeline.exec();
  }
}
```

### JSON Operations

Built-in JSON helpers for complex data:

```typescript
@Injectable()
export class UserCacheService {
  constructor(private readonly redis: RedisService) {}

  async cacheUser(userId: string, userData: UserData): Promise<void> {
    await this.redis.setJson(`user:${userId}`, userData, 3600);
  }

  async getUser(userId: string): Promise<UserData | null> {
    return this.redis.getJson<UserData>(`user:${userId}`);
  }

  async updateUser(
    userId: string,
    updates: Partial<UserData>,
  ): Promise<UserData> {
    return this.redis.getOrSet(
      `user:${userId}`,
      async () => {
        const user = await this.userRepository.findById(userId);
        return { ...user, ...updates };
      },
      3600,
    );
  }
}
```

## 🔍 Monitoring and Debugging

### Connection Statistics

```typescript
@Injectable()
export class HealthService {
  constructor(private readonly connectionManager: RedisConnectionManager) {}

  getRedisStats() {
    return this.connectionManager.getConnectionStats();
    // Returns:
    // {
    //   total: 2,
    //   connections: [
    //     { key: "connection-hash-1", refs: 3, status: "ready" },
    //     { key: "connection-hash-2", refs: 1, status: "ready" }
    //   ]
    // }
  }
}
```

### Health Checks

```typescript
@Controller('health')
export class HealthController {
  constructor(private readonly redis: RedisService) {}

  @Get('redis')
  async checkRedis() {
    try {
      await this.redis.ping();
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date(),
      };
    }
  }
}
```

## 🧪 Testing

### Unit Testing

```typescript
// user.service.spec.ts
describe('UserService', () => {
  let service: UserService;
  let redis: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const mockRedis = {
      get: jest.fn(),
      setJson: jest.fn(),
      getJson: jest.fn(),
      del: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: RedisService,
          useValue: mockRedis,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    redis = module.get(RedisService);
  });

  it('should cache user data', async () => {
    const userData = { id: '1', name: 'John' };
    redis.setJson.mockResolvedValue('OK');

    await service.cacheUser('1', userData);

    expect(redis.setJson).toHaveBeenCalledWith('user:1', userData, 3600);
  });
});
```

### Integration Testing

```typescript
// redis.integration.spec.ts
describe('Redis Integration', () => {
  let app: INestApplication;
  let redis: RedisService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        RedisModule.forRoot({
          host: 'localhost',
          port: 6380, // Test Redis instance
          db: 15, // Test database
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    redis = app.get<RedisService>(RedisService);
  });

  afterAll(async () => {
    await redis.getRedisInstance().flushdb();
    await app.close();
  });

  it('should store and retrieve data', async () => {
    await redis.set('test-key', 'test-value');
    const result = await redis.get('test-key');
    expect(result).toBe('test-value');
  });
});
```

## 📊 Performance Considerations

### Connection Pooling

The module automatically pools connections based on configuration fingerprints:

```typescript
// Same configuration = shared connection
const config = {
  host: 'localhost',
  port: 6379,
  db: 0,
};

// All these features share one connection
RedisModule.forFeature('session', config);
RedisModule.forFeature('cache', config);
RedisModule.forFeature('queue', config);
```

### Key Prefixing Strategy

Automatic prefixing prevents key collisions:

```typescript
// Feature: 'user'
await redis.set('profile:123', data); // Actual key: 'user:profile:123'
await redis.set('settings:123', data); // Actual key: 'user:settings:123'

// Feature: 'cache'
await redis.set('profile:123', data); // Actual key: 'cache:profile:123'
```

### Memory Management

- **Automatic Cleanup**: Connections are properly closed on module destroy
- **Reference Counting**: Unused connections are cleaned up
- **TTL Management**: Built-in expiration handling

## 🔧 Environment Configuration

### Environment Variables

```bash
# .env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-password
REDIS_DB=0
```

### Docker Compose Example

```yaml
# docker-compose.yml
version: '3.8'
services:
  redis:
    image: redis:8.0
    restart: always
    ports:
      - '${REDIS_PORT}'
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - ./data/redis:/data
```

### Multiple Environments

```typescript
// config/redis.config.ts
export const getRedisConfig = (env: string) => {
  const configs = {
    development: {
      host: 'localhost',
      port: 6379,
      retryAttempts: 3,
    },
    production: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      retryAttempts: 5,
      retryDelay: 2000,
    },
  };

  return configs[env] || configs.development;
};
```

## 🚨 Error Handling

### Connection Errors

```typescript
@Injectable()
export class ResilientService {
  constructor(private readonly redis: RedisService) {}

  async safeGet(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error('Redis error:', error);
      return null; // Graceful degradation
    }
  }

  async safeSet(key: string, value: string): Promise<boolean> {
    try {
      await this.redis.set(key, value);
      return true;
    } catch (error) {
      console.error('Redis set failed:', error);
      return false;
    }
  }
}
```

### Circuit Breaker Pattern

```typescript
@Injectable()
export class CircuitBreakerService {
  private failures = 0;
  private readonly maxFailures = 5;
  private readonly resetTimeout = 30000;
  private lastFailure: Date | null = null;

  constructor(private readonly redis: RedisService) {}

  async safeOperation<T>(operation: () => Promise<T>): Promise<T | null> {
    if (this.isCircuitOpen()) {
      return null;
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isCircuitOpen(): boolean {
    if (this.failures >= this.maxFailures) {
      if (
        this.lastFailure &&
        Date.now() - this.lastFailure.getTime() > this.resetTimeout
      ) {
        this.failures = 0;
        return false;
      }
      return true;
    }
    return false;
  }

  private onSuccess(): void {
    this.failures = 0;
    this.lastFailure = null;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailure = new Date();
  }
}
```

## 🔄 Migration Guide

### From Native ioredis

```typescript
// Before
import Redis from 'ioredis';
const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

// After
@Injectable()
export class MyService {
  constructor(private readonly redis: RedisService) {}

  async myMethod() {
    // Same Redis API available
    await this.redis.set('key', 'value');

    // Plus additional helpers
    await this.redis.setJson('user:123', { name: 'John' });
  }
}
```

### From Other Redis Modules

Most Redis operations remain the same, but you gain:

- Automatic key prefixing
- Connection pooling
- Type safety
- Built-in helpers

## 🤝 Best Practices

### 1. Use Descriptive Feature Names

```typescript
// ✅ Good
RedisModule.forFeature('userSessions');
RedisModule.forFeature('productCache');
RedisModule.forFeature('emailQueue');

// ❌ Avoid
RedisModule.forFeature('redis1');
RedisModule.forFeature('data');
```

### 2. Consistent Key Naming

```typescript
// ✅ Good - hierarchical naming
'user:profile:123';
'user:settings:123';
'cache:product:456';

// ❌ Avoid - flat naming
'userprofile123';
'user_settings_123';
```

### 3. Proper TTL Management

```typescript
// ✅ Good - explicit TTLs
await redis.setJson('session:123', data, 3600); // 1 hour
await redis.setJson('cache:product:456', data, 300); // 5 minutes

// ✅ Good - configuration-based TTLs
const TTL = {
  SESSION: 3600,
  CACHE: 300,
  TEMP: 60,
};
```

### 4. Error Handling

```typescript
// ✅ Good - graceful degradation
async getCachedData(key: string): Promise<Data | null> {
  try {
    return await this.redis.getJson<Data>(key);
  } catch (error) {
    this.logger.error('Cache read failed', error);
    return null; // Don't break the application
  }
}
```

## 📜 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- 📚 [Documentation](./docs)
- 🐛 [Issue Tracker](./issues)
- 💬 [Discussions](./discussions)

---

Built with ❤️ for the NestJS community
