import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { HashUtil } from '@project-utils/hash';

import { UserService } from '../user';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly hashService: HashUtil,
    private readonly jwtService: JwtService,
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

    return { accessToken };
  }

  // async logout() {}
}
