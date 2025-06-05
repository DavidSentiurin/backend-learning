import { Injectable } from '@nestjs/common';

import { RolesEnum } from '../common/enums';
import { HashService } from '../common/services';

import { CreateUserDto, UpdateUserDto } from './dto';
import { UserEntity } from './entities';
import { UsersRepository } from './repositories';
import { SuccessRo } from '../common/ro';

@Injectable()
export class UsersService {
  constructor(
    private readonly hashService: HashService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async getAll(): Promise<UserEntity[]> {
    return this.usersRepository.findAll();
  }

  async findByEmail(
    userEmail: UserEntity['email'],
  ): Promise<UserEntity | null> {
    return this.usersRepository.findByEmail(userEmail);
  }

  async findById(id: UserEntity['id']): Promise<UserEntity | null> {
    return this.usersRepository.findById(id);
  }

  async create(user: CreateUserDto): Promise<UserEntity> {
    const password = await this.hashService.hash(user.password);

    return this.usersRepository.createOne({
      ...user,
      password,
      roles: [RolesEnum.USER],
    });
  }

  async update(
    userId: UserEntity['id'],
    updateData: UpdateUserDto,
  ): Promise<UserEntity | null> {
    const result = await this.usersRepository.updateOne(userId, updateData);

    if (result.affected === 0) return null;

    return this.usersRepository.findById(userId);
  }

  async delete(userId: UserEntity['id']): Promise<SuccessRo> {
    const user = await this.usersRepository.findById(userId);

    if (!user) return { success: false };

    const removedUser = await this.usersRepository.removeOne(user);

    if (!removedUser) return { success: false };

    return { success: true };
  }
}
