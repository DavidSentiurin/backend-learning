import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  IsUniqUserEmailConstraint,
  IsUserIdConstraint,
} from '../common/validators';
import { HashService } from '../common/services';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';

import { UserEntity } from './entities';
import { UsersRepository } from './repositories';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [
    IsUserIdConstraint,
    IsUniqUserEmailConstraint,
    UsersService,
    HashService,
    UsersRepository,
  ],
  controllers: [UsersController],
  exports: [IsUserIdConstraint, IsUniqUserEmailConstraint, UsersService],
})
export class UsersModule {}
