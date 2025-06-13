# NestJS Redis Module

A powerful, TypeScript-first Redis integration for NestJS applications with automatic key prefixing, multiple connection support, and intelligent configuration management.

## ✨ Features

- 🚀 **Zero Configuration** - Works out of the box for simple use cases
- 🔗 **Multiple Connections** - Support for multiple Redis instances with intelligent connection sharing
- 🏷️ **Automatic Key Prefixing** - Built-in namespace isolation using Redis `keyPrefix`
- 🧠 **Smart Defaults** - Automatically detects single vs multiple configurations
- ❌ **Helpful Error Messages** - Clear guidance with typo detection and suggestions
- 🔄 **Lazy Loading** - Connections created only when needed
- 🔧 **TypeScript First** - Full type safety and IntelliSense support
- ⚡ **High Performance** - Connection pooling and sharing for optimal resource usage

## 📦 Installation

```bash
npm install nestjs-redis ioredis
# or
yarn add nestjs-redis ioredis
```

```bash
# Install type definitions
npm install --save-dev @types/ioredis
```

## 🚀 Quick Start

### Single Redis Instance (Zero Configuration)

The simplest setup - perfect for most applications:

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { RedisModule } from 'nestjs-redis';

@Module({
  imports: [
    RedisModule.forRoot({
      host: 'localhost',
      port: 6379,
      password: 'your-password', // optional
    }),
  ],
})
export class AppModule {}
```

```typescript
// user.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRedis } from 'nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class UserService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async cacheUser(userId: string, userData: any): Promise<void> {
    // Keys automatically prefixed with 'default:'
    await this.redis.setex(`user:${userId}`, 3600, JSON.stringify(userData));
  }

  async getUser(userId: string): Promise<any> {
    const data = await this.redis.get(`user:${userId}`);
    return data ? JSON.parse(data) : null;
  }
}
```

That's it! Your Redis keys will be automatically prefixed (e.g., `default:user:123`).

## 🏗️ Configuration

### Basic Configuration

```typescript
RedisModule.forRoot({
  host: 'localhost',
  port: 6379,
  password: 'your-password',
  db: 0,
  keyPrefix: 'myapp:', // Custom prefix (optional)
  retryAttempts: 3,
  retryDelay: 1000,
})
```

### Multiple Redis Instances

For complex applications requiring multiple Redis connections:

```typescript
// app.module.ts
RedisModule.forRoot([
  {
    configName: 'cache',
    host: 'redis-cache.example.com',
    port: 6379,
    db: 0,
    // keyPrefix automatically becomes 'cache:'
  },
  {
    configName: 'session',
    host: 'redis-session.example.com', 
    port: 6379,
    db: 0,
    keyPrefix: 'sess:', // Custom prefix
  },
  {
    configName: 'queue',
    host: 'redis-queue.example.com',
    port: 6379,
    db: 0,
  },
])
```

### Async Configuration

Use async configuration for dynamic setups:

```typescript
// app.module.ts
import { ConfigModule, ConfigService } from '@nestjs/config';

RedisModule.forRootAsync([
  {
    configName: 'cache',
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      host: configService.get('CACHE_REDIS_HOST'),
      port: configService.get('CACHE_REDIS_PORT'),
      password: configService.get('CACHE_REDIS_PASSWORD'),
      db: configService.get('CACHE_REDIS_DB', 0),
    }),
    inject: [ConfigService],
  },
  {
    configName: 'session',
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      host: configService.get('SESSION_REDIS_HOST'),
      port: configService.get('SESSION_REDIS_PORT'),
      password: configService.get('SESSION_REDIS_PASSWORD'),
      keyPrefix: `${configService.get('APP_NAME')}:sess:`,
    }),
    inject: [ConfigService],
  },
])
```

## 🎯 Feature Modules

### Single Configuration

When only one Redis configuration exists, no additional setup needed:

```typescript
// cache.module.ts
@Module({
  imports: [
    RedisModule.forFeature(), // ✅ Automatically uses the only config
  ],
  providers: [CacheService],
})
export class CacheModule {}
```

### Multiple Configurations

When multiple configurations exist, specify which one to use:

```typescript
// cache.module.ts
@Module({
  imports: [
    RedisModule.forFeature({
      name: 'cacheConnection',  // Connection instance name
      configName: 'cache',      // Which config to use
    }),
  ],
  providers: [CacheService],
})
export class CacheModule {}

// session.module.ts  
@Module({
  imports: [
    RedisModule.forFeature({
      configName: 'session', // Uses session config
      // name defaults to 'default'
    }),
  ],
  providers: [SessionService],
})
export class SessionModule {}
```

### Configuration Overrides

Override base configuration for specific use cases:

```typescript
@Module({
  imports: [
    RedisModule.forFeature({
      name: 'specialCache',
      configName: 'cache',
      config: {
        db: 5, // Override database
        commandTimeout: 10000, // Custom timeout
        maxRetriesPerRequest: 10,
      }
    }),
  ],
})
export class SpecialCacheModule {}
```

## 💉 Dependency Injection

### Raw Redis Client

Inject the raw ioredis client for full control:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRedis } from 'nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class UserService {
  constructor(@InjectRedis('cache') private readonly redis: Redis) {}

  async setUser(id: string, data: any): Promise<void> {
    await this.redis.setex(`user:${id}`, 3600, JSON.stringify(data));
  }

  async pipeline(): Promise<void> {
    const pipeline = this.redis.pipeline();
    pipeline.set('key1', 'value1');
    pipeline.set('key2', 'value2');
    await pipeline.exec();
  }
}
```

### Redis Service Wrapper

Use the built-in service wrapper for convenience methods:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRedisService } from 'nestjs-redis';
import { RedisService } from 'nestjs-redis';

@Injectable()
export class UserService {
  constructor(@InjectRedisService('cache') private readonly redis: RedisService) {}

  async cacheUser(id: string, user: any): Promise<void> {
    // Automatic JSON serialization
    await this.redis.setObject(`user:${id}`, user, 3600);
  }

  async getUser(id: string): Promise<any> {
    // Automatic JSON deserialization
    return this.redis.getObject(`user:${id}`);
  }

  async smartCache<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    // Cache with automatic fetch-on-miss
    return this.redis.cache(key, fetcher, 3600);
  }
}
```

## 🔑 Automatic Key Prefixing

Keys are automatically prefixed based on configuration to prevent collisions:

```typescript
// Configuration
{
  configName: 'cache',
  host: 'localhost',
  keyPrefix: 'myapp:cache:' // or auto-generated as 'cache:'
}

// Service usage
await redis.set('user:123', data);
await redis.hset('settings', 'theme', 'dark');

// Actual Redis keys
// myapp:cache:user:123
// myapp:cache:settings
```

## 🛠️ Advanced Usage

### Connection Sharing

Connections with identical final configurations are automatically shared:

```typescript
// These two features share the same Redis connection
RedisModule.forFeature({
  name: 'userCache',
  configName: 'cache',
  config: { db: 2 }
})

RedisModule.forFeature({
  name: 'productCache',
  configName: 'cache', 
  config: { db: 2 } // Identical config = shared connection
})
```

### Health Checks

Monitor Redis connection health:

```typescript
@Controller('health')
export class HealthController {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  @Get('redis')
  async checkRedis() {
    try {
      await this.redis.ping();
      return { status: 'healthy', timestamp: new Date() };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }
}
```

### Environment-Based Configuration

```typescript
RedisModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const env = configService.get('NODE_ENV');
    
    return {
      configName: env,
      host: configService.get(`REDIS_HOST_${env.toUpperCase()}`),
      port: configService.get(`REDIS_PORT_${env.toUpperCase()}`),
      keyPrefix: `${env}:`,
      retryAttempts: env === 'production' ? 5 : 3,
    };
  },
  inject: [ConfigService],
})
```

## ❌ Error Handling

The module provides helpful error messages to guide you:

### Multiple Configurations Available

```typescript
// ❌ Error when multiple configs exist but none specified
RedisModule.forFeature()
// Error: "Multiple Redis configurations available: ['cache', 'session']. 
//         Please specify 'configName' in forFeature() options."
```

### Configuration Not Found

```typescript
// ❌ Error with typo detection
RedisModule.forFeature({ configName: 'chache' })
// Error: "Redis config 'chache' not found. Available configs: ['cache', 'session']. 
//         Did you mean 'cache'?"
```

### Missing Configuration

```typescript
// ❌ Error when no configs registered
RedisModule.forFeature({ configName: 'cache' })
// Error: "Redis config 'cache' not found. No Redis configurations have been registered. 
//         Make sure to call forRoot() or forRootAsync() first."
```

## 📚 Complete Examples

### Simple Blog Application

```typescript
// app.module.ts
@Module({
  imports: [
    RedisModule.forRoot({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
    }),
  ],
  controllers: [PostController],
  providers: [PostService],
})
export class AppModule {}

// post.service.ts
@Injectable()
export class PostService {
  constructor(@InjectRedisService() private readonly redis: RedisService) {}

  async createPost(post: Post): Promise<Post> {
    const saved = await this.postRepository.save(post);
    
    // Cache the post
    await this.redis.setObject(`post:${saved.id}`, saved, 3600);
    
    // Add to recent posts list
    await this.redis.lpush('recent:posts', saved.id);
    await this.redis.ltrim('recent:posts', 0, 99); // Keep last 100
    
    return saved;
  }

  async getPost(id: string): Promise<Post> {
    return this.redis.cache(`post:${id}`, async () => {
      return this.postRepository.findById(id);
    });
  }
}
```

### Microservice with Multiple Redis Instances

```typescript
// app.module.ts
@Module({
  imports: [
    RedisModule.forRoot([
      {
        configName: 'cache',
        host: 'redis-cache.internal',
        port: 6379,
        db: 0,
      },
      {
        configName: 'session',
        host: 'redis-session.internal', 
        port: 6379,
        db: 0,
        keyPrefix: 'sess:',
      },
      {
        configName: 'queue',
        host: 'redis-queue.internal',
        port: 6379,
        db: 0,
      },
    ]),
    UserModule,
    AuthModule, 
    NotificationModule,
  ],
})
export class AppModule {}

// user.module.ts
@Module({
  imports: [
    RedisModule.forFeature({ configName: 'cache' }),
  ],
  providers: [UserService],
})
export class UserModule {}

// auth.module.ts
@Module({
  imports: [
    RedisModule.forFeature({ configName: 'session' }),
  ],
  providers: [AuthService],
})
export class AuthModule {}

// notification.module.ts
@Module({
  imports: [
    RedisModule.forFeature({ configName: 'queue' }),
  ],
  providers: [NotificationService],
})
export class NotificationModule {}
```

## 🔧 Configuration Options

### RedisModuleOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `configName` | `string` | `'default'` | Configuration identifier |
| `host` | `string` | `'localhost'` | Redis server host |
| `port` | `number` | `6379` | Redis server port |
| `password` | `string` | `undefined` | Redis server password |
| `db` | `number` | `0` | Redis database number |
| `keyPrefix` | `string` | `'${configName}:'` | Automatic key prefix |
| `retryAttempts` | `number` | `3` | Connection retry attempts |
| `retryDelay` | `number` | `1000` | Delay between retries (ms) |

All [ioredis options](https://github.com/luin/ioredis/blob/main/lib/redis/RedisOptions.ts) are supported.

### RedisFeatureOptions

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | `string` | `'default'` | Connection instance name |
| `configName` | `string` | `'default'` | Which config to use |
| `config` | `Partial<RedisOptions>` | `{}` | Config overrides |

## 🤝 Best Practices

### 1. Use Descriptive Configuration Names

```typescript
// ✅ Good
{ configName: 'userCache' }
{ configName: 'sessionStore' }
{ configName: 'taskQueue' }

// ❌ Avoid
{ configName: 'redis1' }
{ configName: 'db2' }
```

### 2. Leverage Automatic Key Prefixing

```typescript
// ✅ Let the module handle prefixing
await redis.set('user:123', data); // becomes 'cache:user:123'

// ❌ Don't manually prefix
await redis.set('cache:user:123', data); // becomes 'cache:cache:user:123'
```

### 3. Use Configuration Overrides Sparingly

```typescript
// ✅ Good - specific need
RedisModule.forFeature({
  configName: 'cache',
  config: { db: 5 } // Different database for isolation
})

// ❌ Avoid - should be in base config
RedisModule.forFeature({
  configName: 'cache', 
  config: { host: 'different-host' } // Should be separate config
})
```

### 4. Handle Errors Gracefully

```typescript
@Injectable()
export class CacheService {
  async getCachedData(key: string): Promise<any> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      console.error('Redis error:', error);
      return null; // Fallback gracefully
    }
  }
}
```

## 🧪 Testing

### Unit Testing

```typescript
// cache.service.spec.ts
describe('CacheService', () => {
  let service: CacheService;
  let redis: jest.Mocked<Redis>;

  beforeEach(async () => {
    const mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
      setex: jest.fn(),
    };

    const module = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: getRedisConnectionToken(),
          useValue: mockRedis,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
    redis = module.get(getRedisConnectionToken());
  });

  it('should cache data', async () => {
    redis.setex.mockResolvedValue('OK');
    
    await service.setCache('key', 'value', 300);
    
    expect(redis.setex).toHaveBeenCalledWith('key', 300, '"value"');
  });
});
```

### Integration Testing

```typescript
// Use Redis memory server for testing
import { RedisMemoryServer } from 'redis-memory-server';

describe('Redis Integration', () => {
  let redisServer: RedisMemoryServer;

  beforeAll(async () => {
    redisServer = new RedisMemoryServer();
    const host = await redisServer.getHost();
    const port = await redisServer.getPort();

    // Configure test module with memory server
  });

  afterAll(async () => {
    await redisServer.stop();
  });
});
```

## 🚀 Migration Guide

### From Basic Redis Setup

```typescript
// Before
import { createClient } from 'redis';
const client = createClient({ url: 'redis://localhost:6379' });

// After  
RedisModule.forRoot({ host: 'localhost', port: 6379 })
// Inject with @InjectRedis()
```

### From Other NestJS Redis Libraries

```typescript
// Before (@nestjs-modules/ioredis)
@InjectRedis() redis: Redis

// After (this module)
@InjectRedis() redis: Redis // Same injection!
// But with automatic key prefixing and better configuration
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 🐛 Issues

Found a bug? Please report it on our [GitHub Issues](https://github.com/your-repo/nestjs-redis/issues) page.

## 📖 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.