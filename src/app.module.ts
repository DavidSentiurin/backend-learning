import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HashService } from './common/services';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [HashService],
})
export class AppModule {}
