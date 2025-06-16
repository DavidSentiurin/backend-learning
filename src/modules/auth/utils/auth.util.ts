import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthUtil {
  constructor(private readonly configService: ConfigService) {}

  getAccessTokenExpiration() {
    return Number(this.configService.get('ACCESS_TOKEN_EXPIRATION', 86400)); // fallback is one day
  }
}
