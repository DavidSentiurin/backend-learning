import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

import { HashUtil } from '@project-utils/hash';

import { JwtStrategy } from './strategies';
import { UserModule } from '../user';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('ACCESS_TOKEN_EXPIRATION'),
        },
      }),
    }),
  ],
  providers: [HashUtil, AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
