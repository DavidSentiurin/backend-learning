import { forwardRef, Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { JwtStrategy } from './strategies';
import { HashUtil } from '../../utils/hash';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { AuthGuard } from './guards';
import { AuthUtil } from './utils';
import { SessionModule } from '../session/session.module';

@Global()
@Module({
  imports: [
    UserModule,
    SessionModule,
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(configService.get('ACCESS_TOKEN_EXPIRATION', 86400)), // the fallback is one day
        },
      }),
    }),
  ],
  providers: [
    HashUtil,
    AuthService,
    JwtStrategy,
    AuthGuard,
    AuthUtil,
  ],
  controllers: [AuthController],
  exports: [AuthService, AuthUtil],
})
export class AuthModule {}
