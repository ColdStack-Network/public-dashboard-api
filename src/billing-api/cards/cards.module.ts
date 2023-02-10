import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthnodeApiModule } from '../../authnode-api/authnode-api.module';
import { UserCardRepository } from '../../stripe-api/repositories/user-card.repository';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';

@Module({
  imports: [
    AuthnodeApiModule,
    TypeOrmModule.forFeature([UserCardRepository], 'default'),
  ],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
