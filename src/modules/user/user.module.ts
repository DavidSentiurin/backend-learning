import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { IsUniqUserEmailConstraint, IsUserIdConstraint } from './validators';

import { UserService } from './user.service';
import { UserController } from './user.controller';

import { UserEntity } from './entities';
import { UserRepository } from './repositories';
import { HashUtil } from '../../utils/hash';

import { SessionModule } from '../session/session.module';
import { UserSubscriber } from './subscribers';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), SessionModule],
  providers: [
    IsUserIdConstraint,
    IsUniqUserEmailConstraint,
    UserService,
    HashUtil,
    UserRepository,
    UserSubscriber,
  ],
  controllers: [UserController],
  exports: [IsUserIdConstraint, IsUniqUserEmailConstraint, UserService],
})
export class UserModule {}
