import { Module } from '@nestjs/common';

import {
  IsUniqUserEmailConstraint,
  IsUserIdConstraint,
} from '../common/validators';
import { HashService } from '../common/services';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  providers: [
    IsUserIdConstraint,
    IsUniqUserEmailConstraint,
    UsersService,
    HashService,
  ],
  controllers: [UsersController],
  exports: [IsUserIdConstraint, IsUniqUserEmailConstraint, UsersService],
})
export class UsersModule {}
