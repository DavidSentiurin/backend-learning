import { Injectable } from '@nestjs/common';

import { InjectRedisService } from '../../infrastructure/databases';
import { RedisService } from '../../infrastructure/databases';
import { SESSION_PREFIX } from './contstants';

@Injectable()
export class SessionService {
  constructor(
    @InjectRedisService(SESSION_PREFIX)
    private readonly sessionRedisService: RedisService,
  ) {}

  async set(key: string, value: string, expiration: number) {
    return this.sessionRedisService.setex(key, expiration, value);
  }

  async get(key: string) {
    return this.sessionRedisService.get(key);
  }

  async delete(key: string) {
    return this.sessionRedisService.del(key);
  }
}
