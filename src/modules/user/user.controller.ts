import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiResponse } from '@nestjs/swagger';

import { UserService } from './user.service';

import { GetUser } from './decorators';
import { UpdateUserDto, UserIdDto } from './dto';
import { UserRo } from './ro';
import { UserEntity } from './entities';
import { RolesEnum } from '../../common/enums';
import { Roles } from '../../common/decorators';
import { SuccessRo } from '../../common/ro';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';

@Controller('users')
export class UserController {
  constructor(private usersService: UserService) {}

  @ApiResponse({ type: [UserRo] })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles([RolesEnum.ADMIN])
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles()
  @Get('me')
  ownProfile(@GetUser() user: UserEntity) {
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
