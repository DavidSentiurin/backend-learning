import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { LoginDto, RegisterDto } from './dto';
import { HashUtil } from '../../utils/hash';
import { AuthUtil } from './utils';
import { UserEntity } from '../user/entities';
import { SessionService } from '../session/session.service';
import { AUTH_SESSION_PREFIX } from './constants';
import { SuccessRo } from '../../common/ro';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly hashService: HashUtil,
    private readonly jwtService: JwtService,
    private readonly authUtil: AuthUtil,
    private readonly sessionService: SessionService,
  ) {}

  private async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        'The email or password you entered is incorrect',
      );
    }

    const isPasswordValid = await this.hashService.verify(
      password,
      user.password,
    );

    if (isPasswordValid) {
      return user;
    }

    return null;
  }

  async register(registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException(
        'The email or password you entered is incorrect',
      );
    }

    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload);

    const expiration = this.authUtil.getAccessTokenExpiration();

    const authSessionKey = this.authUtil.getAuthSessionKey(user.id);
    await this.sessionService.set(authSessionKey, accessToken, expiration);

    return { accessToken };
  }

  async logout(userId: UserEntity['id']):Promise<SuccessRo> {
    const authSessionKey = this.authUtil.getAuthSessionKey(userId);

    const result = await this.sessionService.delete(authSessionKey);

    if (!result) return { success: false };

    return { success: true };
  }
}
