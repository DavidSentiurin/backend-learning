import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthUtil {
  constructor(private readonly configService: ConfigService) {}

  getAccessTokenExpiration() {
    return Number(this.configService.get('ACCESS_TOKEN_EXPIRATION', 86400)); // fallback is one day
  }

  getRefreshTokenExpiration() {
    return Number(this.configService.get('REFRESH_TOKEN_EXPIRATION', 604800)); // fallback is seven days
  }

  getRefreshTokenExpirationDate(existingExpirationDate?: Date) {
    const refreshTokenExpirationSeconds = this.getRefreshTokenExpiration();

    if (existingExpirationDate) {
      return existingExpirationDate;
    }

    return new Date(Date.now() + refreshTokenExpirationSeconds * 1000);
  }
}
