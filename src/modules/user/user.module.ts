import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IsUniqUserEmailConstraint, IsUserIdConstraint } from './validators';

import { UserService } from './user.service';
import { UserController } from './user.controller';

import { UserEntity } from './entities';
import { UserRepository } from './repositories';
import { HashUtil } from '../../utils/hash';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [
    IsUserIdConstraint,
    IsUniqUserEmailConstraint,
    UserService,
    HashUtil,
    UserRepository,
  ],
  controllers: [UserController],
  exports: [IsUserIdConstraint, IsUniqUserEmailConstraint, UserService],
})
export class UserModule {}
