import { Module } from '@nestjs/common';
import { SendGridService } from '../services/SendGrid.service';
import { CeoApiController } from './ceo-api.controller';

@Module({
  controllers: [CeoApiController],
  providers: [SendGridService],
})
export class CeoApiModule {}
