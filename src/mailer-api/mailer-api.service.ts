import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import axios, { AxiosInstance } from 'axios';
import { APP_CONFIGS_KEY, TAppConfigs } from '../common/config';

@Injectable()
export class MailerApiService {
  private axios: AxiosInstance;

  constructor(
    @Inject(APP_CONFIGS_KEY)
    private readonly appConfig: TAppConfigs,
    @InjectPinoLogger(MailerApiService.name)
    private readonly logger: PinoLogger,
  ) {
    this.axios = axios.create({
      baseURL: appConfig.mailerApiUrl,
    });
  }

  async sendMail(type: string, data: { to?: string }): Promise<void> {
    await this.axios
      .post(`__internal/send-mail/${type}`, {
        data,
      })
      .catch((err) => {
        this.logger.error(err);
      });
  }
}
