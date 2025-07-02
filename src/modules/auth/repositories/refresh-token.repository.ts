import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';

import { RefreshTokenEntity } from '../entities';

@Injectable()
export class RefreshTokenRepository extends Repository<RefreshTokenEntity> {
  constructor(private dataSource: DataSource) {
    super(RefreshTokenEntity, dataSource.createEntityManager());
  }
}
