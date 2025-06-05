import { Repository, DataSource } from 'typeorm';
import { UserEntity } from '../entities';
import { CreateUserDto, UpdateUserDto } from '../dto';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersRepository extends Repository<UserEntity> {
  constructor(private dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }

  async findAll(): Promise<UserEntity[]> {
    return this.find();
  }

  async createOne(user: CreateUserDto): Promise<UserEntity> {
    return this.save(user);
  }

  async updateOne(userId: UserEntity['id'], user: UpdateUserDto) {
    return await this.update(userId, user);
  }

  async findByEmail(email: string) {
    return this.findOneBy({ email });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.findOneBy({ id });
  }

  async removeOne(user: UserEntity): Promise<UserEntity | null> {
    return this.remove(user);
  }
}
