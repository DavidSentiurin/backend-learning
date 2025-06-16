import { Injectable } from '@nestjs/common';

import { SessionService } from '../../session/session.service';
import { UserEntity } from '../../user/entities';
import { SuccessRo } from '../../../common/ro';
import { AUTH_SESSION_PREFIX } from '../constants';
import { AuthUtil } from '../utils';

@Injectable()
export class AuthSessionService {
  constructor(
    private readonly sessionService: SessionService,
    private readonly authUtil: AuthUtil,
  ) {}

  getAuthSessionKey = (userId: string): string =>
    `${AUTH_SESSION_PREFIX}:${userId}`;

  async get(userId: UserEntity['id']): Promise<string | null> {
    const authSessionKey = this.getAuthSessionKey(userId);
    return await this.sessionService.get(authSessionKey);
  }

  async set(userId: UserEntity['id'], accessToken: string): Promise<void> {
    const expiration = this.authUtil.getAccessTokenExpiration();

    const authSessionKey = this.getAuthSessionKey(userId);
    await this.sessionService.set(authSessionKey, accessToken, expiration);
  }

  async delete(userId: UserEntity['id']): Promise<SuccessRo> {
    const authSessionKey = this.getAuthSessionKey(userId);
    const result = await this.sessionService.delete(authSessionKey);

    if (!result) return { success: false };

    return { success: true };
  }
}
