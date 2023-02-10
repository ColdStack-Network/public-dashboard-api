import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCardEntity } from '../entities/user-card.entity';
import { UserCardRepository } from '../../stripe-api/repositories/user-card.repository';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(UserCardRepository, 'default')
    private readonly userCardRepo: UserCardRepository,
  ) {}

  getUserCards(userId: string): Promise<UserCardEntity[]> {
    return this.userCardRepo.getByUserId(userId);
  }

  async deleteUserCard(userId: string, cardId: string): Promise<void> {
    const card = await this.userCardRepo.findOneOrFail({
      where: {
        id: cardId,
        userId,
        deleted: false,
      },
    });

    if (card.default) {
      throw new Error('You cannot delete default card.');
    }

    await this.userCardRepo.update(
      {
        id: cardId,
        userId,
      },
      { deleted: true },
    );
  }

  async updateDefaultCard(userId: string, cardId: string): Promise<void> {
    const card = await this.userCardRepo.findOne({
      where: {
        id: cardId,
        userId,
        deleted: false,
      },
    });

    if (!card) {
      throw new Error('Cannot set deleted card as default');
    }

    await this.userCardRepo.update(
      {
        userId,
        deleted: false,
      },
      {
        default: false,
      },
    );

    await this.userCardRepo.update(
      {
        id: cardId,
        userId,
      },
      {
        default: true,
      },
    );
  }

  async checkIfAnyExists(userId: string): Promise<boolean> {
    const userCardsCount = await this.userCardRepo.count({
      where: { userId },
    });

    return userCardsCount > 0;
  }
}
