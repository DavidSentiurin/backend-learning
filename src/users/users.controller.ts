import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { Roles } from '../common/decorators';
import { RolesEnum } from '../common/enums';
import { SuccessRo } from '../common/ro';

import { JwtAuthGuard, RolesGuard } from '../auth/guards';

import { GetUser } from './decorators';
import { UpdateUserDto, UserIdDto } from './dto';
import { UserRo } from './ro';
import { UsersService } from './users.service';
import { UserEntity } from './entities';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiResponse({ type: [UserRo] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([RolesEnum.ADMIN])
  @Get()
  async findAllUsers() {
    const users = await this.usersService.getAll();

    return users.map(UserRo.fromEntity);
  }

  @ApiResponse({ type: UserRo })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles()
  @Get('me')
  async ownProfile(@GetUser() user: UserEntity) {
    return UserRo.fromEntity(user);
  }

  @ApiResponse({ type: UserRo })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles()
  @Get(':id')
  async findUserById(@Param() params: UserIdDto) {
    const user = await this.usersService.findById(params.id);

    if (!user) throw new NotFoundException();

    return UserRo.fromEntity(user);
  }

  @ApiResponse({ type: UserRo })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles()
  @Patch(':id')
  async update(@Param() params: UserIdDto, @Body() user: UpdateUserDto) {
    const updatedUser = await this.usersService.update(params.id, user);

    if (!updatedUser) throw new NotFoundException();

    return UserRo.fromEntity(updatedUser);
  }

  @ApiResponse({ type: SuccessRo })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([RolesEnum.ADMIN])
  @Delete(':id')
  async delete(@Param() params: UserIdDto): Promise<SuccessRo> {
    const { success } = await this.usersService.delete(params.id);

    if (!success) throw new NotFoundException();

    return { success: true };
  }
}
