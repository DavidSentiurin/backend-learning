import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IsUniqUserEmailConstraint, IsUserIdConstraint } from './validators';

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
    UserService,
    HashUtil,
    UserRepository,
    QueryRunnerFactory,
    UserSubscriber,
  ],
  controllers: [UserController],
  exports: [IsUserIdConstraint, IsUniqUserEmailConstraint, UserService],
})
export class UserModule {}
