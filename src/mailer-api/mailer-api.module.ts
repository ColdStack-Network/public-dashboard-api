import { Module } from '@nestjs/common';
import { MailerApiService } from './mailer-api.service';

@Module({
  providers: [MailerApiService],
})
export class MailerApiModule {}
