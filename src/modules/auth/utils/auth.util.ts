import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../infrastructure/databases';
import { UserEntity } from '../../user/entities';
import { ConfigService } from '@nestjs/config';
import {AUTH_SESSION_PREFIX} from "../constants";

@Injectable()
export class AuthUtil {
  constructor(private readonly configService: ConfigService) {}

  getAccessTokenExpiration() {
    return Number(this.configService.get('ACCESS_TOKEN_EXPIRATION', 86400)); // fallback is one day
  }
}
