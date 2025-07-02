import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { UserService } from './user.service';

import { GetUser } from './decorators';
import { UpdateUserDto, UserIdDto } from './dto';
import { UserRo } from './ro';
import { UserEntity } from './entities';
import { SuccessRo } from '../../common/ro';
import { AuthGuard, ResourceGuard } from 'nest-keycloak-connect';

@Controller('users')
export class UserController {
  constructor(private usersService: UserService) {}

  @ApiResponse({ type: [UserRo] })
  @UseGuards(AuthGuard, ResourceGuard)
  @Get()
  async findAllUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    const paginatedUsers = await this.usersService.getPaginatedAll({
      page,
      limit,
    });

    return {
      ...paginatedUsers,
      items: paginatedUsers.items.map((user) => UserRo.fromEntity(user)),
    };
  }

  @ApiResponse({ type: UserRo })
  @UseGuards(AuthGuard, ResourceGuard)
  @Get('me')
  ownProfile(@GetUser() user: UserEntity) {
    return UserRo.fromEntity(user);
  }

  @ApiResponse({ type: UserRo })
  @UseGuards(AuthGuard, ResourceGuard)
  @Get(':id')
  async findUserById(@Param() params: UserIdDto) {
    const user = await this.usersService.findById(params.id);

    if (!user) {
      throw new InternalServerErrorException({
        message: ['User system temporarily unavailable'],
        error: 'SYSTEM_ERROR',
        statusCode: 500,
      });
    }

    return UserRo.fromEntity(user);
  }

  @ApiResponse({ type: UserRo })
  @UseGuards(AuthGuard, ResourceGuard)
  @Patch(':id')
  async update(@Param() params: UserIdDto, @Body() user: UpdateUserDto) {
    const updatedUser = await this.usersService.update(params.id, user);

    if (!updatedUser) {
      throw new InternalServerErrorException({
        message: ['User system temporarily unavailable'],
        error: 'SYSTEM_ERROR',
        statusCode: 500,
      });
    }

    return UserRo.fromEntity(updatedUser);
  }

  @ApiResponse({ type: SuccessRo })
  @UseGuards(AuthGuard, ResourceGuard)
  @Delete(':id')
  async delete(@Param() params: UserIdDto): Promise<SuccessRo> {
    const { success } = await this.usersService.delete(params.id);

    if (!success) {
      throw new InternalServerErrorException({
        message: ['User system temporarily unavailable'],
        error: 'SYSTEM_ERROR',
        statusCode: 500,
      });
    }

    return { success: true };
  }
}
