import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../../user/user.service';
import { LoginDto, RegisterDto } from '../dto';
import { HashUtil } from '../../../utils/hash';
import { UserEntity } from '../../user/entities';
import { SuccessRo } from '../../../common/ro';
import { AuthSessionService } from './auth-session.service';
import { AuthUtil } from '../utils';
import { RefreshTokenRepository } from '../repositories';
import { RefreshTokenEntity } from '../entities';
import { LoginRo } from '../ro';
import { IJwtPayload } from '../interfaces';
import * as crypto from 'node:crypto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly hashService: HashUtil,
    private readonly jwtService: JwtService,
    private readonly authSessionService: AuthSessionService,
    private readonly authUtil: AuthUtil,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  private async validateUser(
    email: string,
    password: string,
  ): Promise<UserEntity | undefined> {
    const user = await this.userService.findByEmail(email);

    if (!user) return;

    const isPasswordValid = await this.hashService.verify(
      password,
      user.password,
    );

    if (isPasswordValid) {
      return user;
    }
  }

  async register(registerDto: RegisterDto): Promise<UserEntity | undefined> {
    return this.userService.create(registerDto);
  }

  async login(loginDto: LoginDto): Promise<LoginRo | undefined> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) return;

    return this.refreshTokenRepository.manager.transaction(
      async (entityManager) => {
        const refreshToken = crypto.randomBytes(32).toString('base64');

        const existedRefreshToken = await entityManager.findOneBy(
          RefreshTokenEntity,
          { user: { id: user.id } },
        );

        const refreshTokenEntity =
          existedRefreshToken ||
          entityManager.create(RefreshTokenEntity, { refreshToken });

        const payload: IJwtPayload = {
          rId: refreshTokenEntity.id,
          sub: user.id,
        };

        const accessToken = this.jwtService.sign(payload, {
          expiresIn: this.authUtil.getAccessTokenExpiration(),
        });

        const expiresAt = this.authUtil.getRefreshTokenExpirationDate();

        // refreshTokenEntity.refreshToken = refreshToken;

        await entityManager.save(
          RefreshTokenEntity,
          // refreshTokenEntity?.id,
          {
            id: refreshTokenEntity?.id,
            refreshToken,
            expiresAt,
            user: entityManager.create(UserEntity, { id: user.id }),
          },
          // ['user.id'],
        );

        await this.authSessionService.set(user.id, accessToken);

        return { accessToken, refreshToken };
      },
    );
  }

  async logout(userId: UserEntity['id']): Promise<SuccessRo | undefined> {
    return this.refreshTokenRepository.manager.transaction(
      async (entityManager) => {
        await entityManager.delete(RefreshTokenEntity, {
          user: { id: userId },
        });

        return this.authSessionService.delete(userId);
      },
    );
  }

  async removeExpiredRefreshTokens(): Promise<SuccessRo | undefined> {
    return this.refreshTokenRepository.manager.transaction(
      async (entityManager) => {
        await entityManager
          .createQueryBuilder(RefreshTokenEntity, 'refresh_tokens')
          .delete()
          .where('expires_at < :now', { now: new Date() })
          .execute();

        return { success: true };
      },
    );
  }

  async getRefreshToken(
    userId: UserEntity['id'],
  ): Promise<RefreshTokenEntity | undefined> {
    const refreshTokenEntity = await this.refreshTokenRepository.findOneBy({
      user: { id: userId },
    });

    if (!refreshTokenEntity) return;

    return refreshTokenEntity;
  }
}
