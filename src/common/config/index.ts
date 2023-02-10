import { ConfigType } from '@nestjs/config';
import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces';
import { appConfigsFactory } from './app.config';
import { createTypeormConfig } from './typeorm.config';

const appConfig = appConfigsFactory();
const typeormConfig = createTypeormConfig();

export const configModuleOptions: ConfigModuleOptions = {
  load: [appConfig, typeormConfig],
  isGlobal: true,
};

export const APP_CONFIGS_KEY = appConfig.KEY;

export type TAppConfigs = ConfigType<typeof appConfig>;
