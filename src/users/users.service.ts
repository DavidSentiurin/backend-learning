import { Injectable } from '@nestjs/common';

import { LanguagesEnum, RolesEnum } from '../common/enums';

import { CreateUserDto, UpdateUserDto } from './dto';
import { UserEntity } from './entities';
import { HashService } from '../common/services';

@Injectable()
export class UsersService {
  constructor(private readonly hashService: HashService) {}

  private readonly users: UserEntity[] = [
    {
      id: 'u1a9b2c3',
      avatar: 'https://i.pravatar.cc/150?img=1',
      email: 'emma.williams@example.com',
      firstName: 'Emma',
      lastName: 'Williams',
      passwordHash: '$2b$10$abc123hashedexamplepassword1',
      language: LanguagesEnum.English,
      isTermsConfirmed: true,
      roles: [RolesEnum.ADMIN],
    },
    {
      id: 'u4d5e6f7g',
      avatar: 'https://i.pravatar.cc/150?img=5',
      email: 'dmytro.kovalenko@example.com',
      firstName: 'Dmytro',
      lastName: 'Kovalenko',
      passwordHash: '$2b$10$abc123hashedexamplepassword2',
      language: LanguagesEnum.Ukrainian,
      isTermsConfirmed: true,
      roles: [RolesEnum.USER],
    },
    {
      id: 'u8h9i0j1k',
      avatar: 'https://i.pravatar.cc/150?img=12',
      email: 'lucas.johnson@example.com',
      firstName: 'Lucas',
      lastName: 'Johnson',
      passwordHash: '$2b$10$abc123hashedexamplepassword3',
      language: LanguagesEnum.English,
      isTermsConfirmed: true,
      roles: [RolesEnum.USER],
    },
  ];

  async getAll(): Promise<UserEntity[]> {
    return this.users;
  }

  async findByEmail(
    userEmail: UserEntity['email'],
  ): Promise<UserEntity | undefined> {
    return this.users.find((user) => user.email === userEmail);
  }

  async findById(id: UserEntity['id']): Promise<UserEntity | undefined> {
    return this.users.find((user) => user.id === id);
  }

  async create(user: CreateUserDto): Promise<UserEntity> {
    const passwordHash = await this.hashService.hash(user.password);

    const createdUser: UserEntity = {
      ...user,
      id: Math.random().toString().slice(2, 11),
      passwordHash,
      roles: user.roles || [RolesEnum.USER],
    };

    this.users.push(createdUser);

    return createdUser;
  }

  async update(
    userId: UserEntity['id'],
    updateData: UpdateUserDto,
  ): Promise<UserEntity | undefined> {
    const userIndex = this.users.findIndex((u) => u.id === userId);

    if (userIndex === -1) return;

    const providedFields = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined),
    );

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...providedFields,
    };

    return this.users[userIndex];
  }

  async delete(userId: UserEntity['id']): Promise<{ success: boolean }> {
    const userIndex = this.users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      return { success: false };
    }

    this.users.splice(userIndex, 1);

    return { success: true };
  }
}
