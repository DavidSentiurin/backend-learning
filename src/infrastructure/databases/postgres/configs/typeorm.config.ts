import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SeederOptions } from 'typeorm-extension';
import { join } from 'path';

dotenvConfig({ path: '.env' });

type DataSourceConfig = DataSourceOptions & SeederOptions;

const config: DataSourceConfig = {
  type: 'postgres',
  host: `${process.env.POSTGRES_HOST}`,
  port: Number(process.env.POSTGRES_PORT),
  username: `${process.env.POSTGRES_USER}`,
  password: `${process.env.POSTGRES_PASSWORD}`,
  database: `${process.env.POSTGRES_DB}`,
  entities: [join(__dirname, '../../**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../migrations/**/*{.ts,.js}')],
  seeds: [join(__dirname, '../seeders/**/*{.ts,.js}')],
  factories: [join(__dirname, '../factories/**/*{.ts,.js}')],
  synchronize: process.env.POSTGRES_SYNCHRONIZE === 'true',
  logging: process.env.POSTGRES_LOGGING === 'true',
  migrationsTableName: 'migrations',
};

const dataSource = new DataSource(config);

export { config };
export default dataSource;
