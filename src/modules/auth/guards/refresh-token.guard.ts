import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

import { AuthService } from '../services';
import { UserEntity } from '../../user/entities';
import { IJwtPayload } from '../interfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  private readonly errorInstance = new BadRequestException(
    'Refresh token invalid',
  );

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<{ user: UserEntity; body: { refreshToken: string } }>();
    const user = request.user;
    const reqRefreshToken = request.body.refreshToken;

    const refreshTokenEntity = await this.authService.getRefreshToken(user.id);

    // console.log('refreshTokenEntity', refreshTokenEntity);

    if (!refreshTokenEntity) throw this.errorInstance;

    // console.log('reqRefreshToken', reqRefreshToken);

    if (reqRefreshToken !== refreshTokenEntity.refreshToken)
      throw this.errorInstance;

    this.jwtService.verify<IJwtPayload>(reqRefreshToken);

    return true;
  }
}
