import { Injectable } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';

import { IQueryRunnerFactory } from '../../redis/interfaces';

@Injectable()
export class QueryRunnerFactory implements IQueryRunnerFactory {
  constructor(private readonly dataSource: DataSource) {}

  create(): QueryRunner {
    return this.dataSource.createQueryRunner();
  }
}
