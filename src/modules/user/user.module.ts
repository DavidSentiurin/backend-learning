import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  IsUniqUserEmailConstraint,
  IsUserEmailExistConstraint,
  IsUserIdConstraint,
} from './validators';

import { UserService } from './user.service';
import { UserController } from './user.controller';

import { UserEntity } from './entities';
import { UserRepository } from './repositories';
import { HashUtil } from '../../utils/hash';

import { SessionModule } from '../session/session.module';
import { QueryRunnerFactory } from '../../infrastructure/databases';
import { UserSubscriber } from './subscriber';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), SessionModule],
  providers: [
    IsUserIdConstraint,
    IsUniqUserEmailConstraint,
    IsUserEmailExistConstraint,
    UserService,
    HashUtil,
    UserRepository,
    QueryRunnerFactory,
    UserSubscriber,
  ],
  controllers: [UserController],
  exports: [
    IsUserIdConstraint,
    IsUniqUserEmailConstraint,
    IsUserEmailExistConstraint,
    UserService,
  ],
})
export class UserModule {}
