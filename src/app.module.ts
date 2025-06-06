import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { HashUtil } from '@project-utils/hash';

// Modules
import { AuthModule } from '@project-modules/auth';
import { UserModule } from '@project-modules/user';
import { PostgresModule } from '@project-infrastructure/databases';

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
