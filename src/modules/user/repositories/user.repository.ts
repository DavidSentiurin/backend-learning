import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { UserEntity } from '../entities';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  constructor(private dataSource: DataSource) {
    super(UserEntity, dataSource.createEntityManager());
  }
}
