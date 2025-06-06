import { Injectable } from '@nestjs/common';
import {
  Pagination,
  IPaginationOptions,
  paginate,
} from 'nestjs-typeorm-paginate';

import { RolesEnum } from '@project-common/enums';
import { SuccessRo } from '@project-common/ro';
import { HashUtil } from '@project-utils/hash';

import { CreateUserDto, UpdateUserDto } from './dto';
import { UserEntity } from './entities';
import { UserRepository } from './repositories';

@Injectable()
export class UserService {
  constructor(
    private readonly hashService: HashUtil,
    private readonly usersRepository: UserRepository,
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

  async delete(id: UserEntity['id']): Promise<SuccessRo> {
    const user = await this.usersRepository.findOneBy({ id });

    if (!user) return { success: false };

    const removedUser = await this.usersRepository.remove(user);

    if (!removedUser) return { success: false };

    return { success: true };
  }
}
