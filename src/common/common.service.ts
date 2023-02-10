import { Inject, Injectable } from '@nestjs/common';
import prettyBytes from 'pretty-bytes';
import { TariffIdEnum } from '../tariff-api/dto/TariffEnum';
import { APP_CONFIGS_KEY, TAppConfigs } from './config';

@Injectable()
export class CommonService {
  constructor(
    @Inject(APP_CONFIGS_KEY)
    private readonly appConfigs: TAppConfigs,
  ) {}

  getDefaultTariffId(): TariffIdEnum {
    return this.appConfigs.isDevEnv
      ? TariffIdEnum['PayAsYouGo[dev]']
      : TariffIdEnum.PayAsYouGo;
  }

  getDefaultTariffIdForCompany(): TariffIdEnum {
    return this.appConfigs.isDevEnv
      ? TariffIdEnum['Corporate[dev]']
      : TariffIdEnum.Corporate;
  }

  getPrettyBytes(bytes: string | number): {
    quantity: string;
    unit: string;
  } {
    const readableStorageUsage = prettyBytes(
      parseInt(bytes ? (bytes as string) : '0'),
    );

    return {
      quantity: readableStorageUsage.split(' ')[0],
      unit: readableStorageUsage.split(' ')[1],
    };
  }

  getTrialEnd(): number {
    return (
      new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        new Date().getDate(),
      ).getTime() / 1000
    );
  }
}
