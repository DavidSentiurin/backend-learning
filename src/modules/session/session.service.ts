import { Injectable } from '@nestjs/common';

import { RedisService } from '../../infrastructure/databases';

@Injectable()
export class SessionService {
  constructor(private readonly sessionRedisService: RedisService) {}

  async set(key: string, value: string, expiration: number) {
    return this.sessionRedisService.setex(key, expiration, value);
  }

  async get(key: string): Promise<string | null> {
    return this.sessionRedisService.get(key);
  }

  async delete(key: string) {
    return this.sessionRedisService.del(key);
  }
}
