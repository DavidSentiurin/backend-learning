import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

import { PostgresModule } from './infrastructure/databases';
import { HashUtil } from './utils/hash';

@Module({
  imports: [
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PostgresModule,
  ],
  controllers: [],
  providers: [HashUtil],
})
export class AppModule {}
