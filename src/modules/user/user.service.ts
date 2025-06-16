import { Injectable } from '@nestjs/common';
import {
  Pagination,
  IPaginationOptions,
  paginate,
} from 'nestjs-typeorm-paginate';

import { CreateUserDto, UpdateUserDto } from './dto';
import { UserEntity } from './entities';
import { UserRepository } from './repositories';
import { HashUtil } from '../../utils/hash';
import { RolesEnum } from '../../common/enums';
import { SuccessRo } from '../../common/ro';
import { QueryRunnerFactory } from '../../infrastructure/databases';
import { USER_SUB_REMOVE_EVENT } from './constants';

@Injectable()
export class UserService {
  constructor(
    private readonly hashService: HashUtil,
    private readonly usersRepository: UserRepository,
    private readonly queryRunnerFactory: QueryRunnerFactory,
  ) {}

  async getAll(): Promise<UserEntity[]> {
    return this.usersRepository.find();
  }

  async getPaginatedAll(
    options: IPaginationOptions,
  ): Promise<Pagination<UserEntity>> {
    return paginate<UserEntity>(this.usersRepository, options);
  }

  async findByEmail(email: UserEntity['email']): Promise<UserEntity | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findById(id: UserEntity['id']): Promise<UserEntity | null> {
    return this.usersRepository.findOneBy({ id });
  }

  async create(user: CreateUserDto): Promise<UserEntity> {
    const password = await this.hashService.hash(user.password);

    return this.usersRepository.save({
      ...user,
      password,
      roles: [RolesEnum.USER],
    });
  }

  async update(
    id: UserEntity['id'],
    updateData: UpdateUserDto,
  ): Promise<UserEntity | null> {
    const result = await this.usersRepository.update(id, updateData);

    if (result.affected === 0) return null;

    return this.usersRepository.findOneBy({ id });
  }

  async delete(userId: UserEntity['id']): Promise<SuccessRo> {
    const queryRunner = this.queryRunnerFactory.create();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();

      const user = queryRunner.manager.create(UserEntity, { id: userId });

      const subscriptionData = {
        id: userId,
        eventType: USER_SUB_REMOVE_EVENT,
      };

      await queryRunner.manager.remove(UserEntity, user, {
        data: subscriptionData,
      });

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
