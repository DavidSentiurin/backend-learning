import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { UserModule } from './modules/user/user.module';

import { PostgresModule, RedisModule } from './infrastructure/databases';
import { HashUtil } from './utils/hash';
import { SessionModule } from './modules/session/session.module';
import { KeycloakModule } from './infrastructure/apis';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard, Resource, ResourceGuard, RoleGuard } from 'nest-keycloak-connect';
import { UserEntity } from './modules/user/entities';

@Resource(UserEntity.name)
@Module({
  imports: [
    UserModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    KeycloakModule,
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
    ScheduleModule.forRoot(),
    PostgresModule,
    SessionModule,
  ],
  controllers: [],
  providers: [HashUtil],
})
export class AppModule {}
