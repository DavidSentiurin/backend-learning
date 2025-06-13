import { Module } from '@nestjs/common';

import { SessionService } from './session.service';
import { RedisModule } from '../../infrastructure/databases';
import { SESSION_PREFIX } from './contstants';

@Module({
  imports: [
    RedisModule.forFeature({
      name: SESSION_PREFIX,
    }),
  ],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
