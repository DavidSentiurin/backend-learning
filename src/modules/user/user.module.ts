import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HashUtil } from '@project-utils/hash';

import { IsUniqUserEmailConstraint, IsUserIdConstraint } from './validators';

import { UserService } from './user.service';
import { UserController } from './user.controller';

import { UserEntity } from './entities';
import { UserRepository } from './repositories';

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
