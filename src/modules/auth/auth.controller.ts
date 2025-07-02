import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { LoginRo } from './ro';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto';

import { AuthService } from './services';
import { UserRo } from '../user/ro';
import { SuccessRo } from '../../common/ro';
import { GetUser } from '../user/decorators';
import { AuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({ type: UserRo })
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<UserRo> {
    const createdUser = await this.authService.register(registerDto);

    if (!createdUser) {
      throw new InternalServerErrorException({
        message: ['Login system temporarily unavailable'],
        error: 'SYSTEM_ERROR',
        statusCode: 500,
      });
    }

    return UserRo.fromEntity(createdUser);
  }

  @ApiResponse({ type: LoginRo })
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginRo> {
    const tokens = await this.authService.login(loginDto);

    if (!tokens) {
      throw new InternalServerErrorException({
        message: ['Login system temporarily unavailable'],
        error: 'SYSTEM_ERROR',
        statusCode: 500,
      });
    }

    return tokens;
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  async logout(@GetUser('id') userId: UserRo['id']): Promise<SuccessRo> {
    const { success } = (await this.authService.logout(userId)) || {};

    if (!success) {
      throw new InternalServerErrorException({
        message: ['Login system temporarily unavailable'],
        error: 'SYSTEM_ERROR',
        statusCode: 500,
      });
    }

    return { success };
  }

  @Post('refresh')
  @UseGuards(AuthGuard)
  async refresh(
    @GetUser('id') userId: UserRo['id'],
    @Body() refreshToken: RefreshTokenDto,
  ) {
    console.log('refreshToken', refreshToken);
  }
}
