import Stripe from 'stripe';
import { EntityRepository, Repository } from 'typeorm';
import { UserCardEntity } from '../../billing-api/entities/user-card.entity';

@EntityRepository(UserCardEntity)
export class UserCardRepository extends Repository<UserCardEntity> {
  getByUserId(userId: string): Promise<UserCardEntity[]> {
    return this.find({
      where: { userId, deleted: false },
    });
  }

  async saveCard(
    userId: string,
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<UserCardEntity> {
    const { brand, country, exp_month, exp_year, funding, last4, network } =
      paymentIntent.charges.data[0].payment_method_details.card;

    const cardDetails = {
      userId,
      brand,
      country,
      expMonth: exp_month.toString(),
      expYear: exp_year.toString(),
      funding,
      last4,
      network,
    };

    const existingCard = await this.findOne({
      where: cardDetails,
    });

    if (existingCard) {
      return existingCard;
    }

    const anyCardExists = await this.findOne({
      where: {
        userId,
      },
    });

    const isDefault = !anyCardExists;

    const newCard = await this.save({ default: isDefault, ...cardDetails });

    return newCard;
  }

  getDefaultCardForUser(userId: string): Promise<UserCardEntity> {
    return this.findOne({
      where: { userId, default: true, deleted: false },
    });
  }
}
