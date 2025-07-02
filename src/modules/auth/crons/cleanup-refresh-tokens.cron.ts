import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { AuthService } from '../services';

@Injectable()
export class CleanupRefreshTokensCron {
  constructor(private readonly authService: AuthService) {}

  @Cron('* * 22 * * *')
  async removeExpiredTokens() {
    await this.authService.removeExpiredRefreshTokens();
  }
}
