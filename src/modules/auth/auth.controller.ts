import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { LoginRo } from './ro';
import { LoginDto, RegisterDto } from './dto';

import { AuthService } from './services';
import { UserRo } from '../user/ro';
import { GetUser } from '../user/decorators';
import { AuthGuard } from './guards';

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

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@GetUser('id') userId: UserRo['id']) {
    return this.authService.logout(userId);
  }
}
