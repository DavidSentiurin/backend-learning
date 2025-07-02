import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { JwtStrategy } from './strategies';
import { HashUtil } from '../../utils/hash';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService, AuthSessionService } from './services';
import { AuthGuard } from './guards';
import { AuthUtil } from './utils';
import { RefreshTokenEntity } from './entities';
import { RefreshTokenRepository } from './repositories';
import { CleanupRefreshTokensCron } from './crons';
import { QueryRunnerFactory } from '../../infrastructure/databases';
import { SessionModule } from '../session/session.module';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshTokenEntity]),
    UserModule,
    SessionModule,
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
    }),
  ],
  providers: [
    HashUtil,
    AuthService,
    AuthSessionService,
    JwtStrategy,
    AuthGuard,
    AuthUtil,
    RefreshTokenRepository,
    CleanupRefreshTokensCron,
    QueryRunnerFactory,
  ],
  controllers: [AuthController],
  exports: [AuthService, AuthSessionService, AuthUtil],
})
export class AuthModule {}
