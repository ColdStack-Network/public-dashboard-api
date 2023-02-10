import { registerAs } from '@nestjs/config';
import { checkMissedVariables } from '../../utils/checkMissedVariables';
import { ConnectionOptions } from 'typeorm';

export function createTypeormConfig() {
  const port = +process.env.DASHBOARD_API_DB_PORT;
  const host = process.env.DASHBOARD_API_DB_HOST;
  const username = process.env.DASHBOARD_API_DB_USERNAME;
  const password = process.env.DASHBOARD_API_DB_PASSWORD;
  const database = process.env.DASHBOARD_API_DB_NAME;

  const missingKey = checkMissedVariables({
    port,
    host,
    username,
    password,
    database,
  });

  if (missingKey) {
    throw new Error(`Config key database ${missingKey} is missing.`);
  }

  return registerAs(
    'typeorm',
    (): ConnectionOptions => ({
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
      type: 'postgres',
      host,
      port,
      username,
      password,
      database,
      migrationsRun: true,
      logging: process.env.NODE_ENV === 'development',
    }),
  );
}
