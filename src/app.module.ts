import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

import { PostgresModule, RedisModule } from './infrastructure/databases';
import { HashUtil } from './utils/hash';
import { SessionModule } from './modules/session/session.module';
import { SESSION_PREFIX } from './modules/session/contstants';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RedisModule.forRootAsync([
      {
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          host: configService.get('SESSION_REDIS_HOST', 'localhost'),
          port: configService.get('SESSION_REDIS_PORT', 6379),
          password: configService.get('SESSION_REDIS_PASSWORD'),
          db: configService.get('SESSION_REDIS_DB', 0),
          keyPrefix: `${SESSION_PREFIX}:`, // if this key is not provided, please use `name` as a keyPrefix
        }),
        inject: [ConfigService],
      },
    ]),
    PostgresModule,
    SessionModule,
  ],
  controllers: [],
  providers: [HashUtil],
})
export class AppModule {}
