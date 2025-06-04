import { Body, Controller, Post } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { UserRo } from '../users/ro';

import { AuthService } from './auth.service';

import { LoginRo } from './ro';
import { LoginDto, RegisterDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({ type: UserRo })
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<UserRo> {
    const createdUser = await this.authService.register(registerDto);

    return UserRo.fromEntity(createdUser);
  }

  @ApiResponse({ type: LoginRo })
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginRo> {
    return this.authService.login(loginDto);
  }

  // @Post('logout')
  // async logout() {
  //   return this.authService.logout();
  // }
}
