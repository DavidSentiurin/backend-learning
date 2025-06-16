import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../../user/user.service';
import { LoginDto, RegisterDto } from '../dto';
import { HashUtil } from '../../../utils/hash';
import { UserEntity } from '../../user/entities';
import { SuccessRo } from '../../../common/ro';
import { AuthSessionService } from './auth-session.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly hashService: HashUtil,
    private readonly jwtService: JwtService,
    private readonly authSessionService: AuthSessionService,
  ) {}

  private async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

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
    return this.userService.create(registerDto);
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

    await this.authSessionService.set(user.id, accessToken);

    return { accessToken };
  }

  async logout(userId: UserEntity['id']): Promise<SuccessRo> {
    return this.authSessionService.delete(userId);
  }
}
