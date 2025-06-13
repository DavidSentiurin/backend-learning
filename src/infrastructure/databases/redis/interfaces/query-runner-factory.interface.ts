import { QueryRunner } from 'typeorm';

export interface IQueryRunnerFactory {
  create(): QueryRunner;
}
