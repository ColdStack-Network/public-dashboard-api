import { ApiProperty } from '@nestjs/swagger';
import { Entity } from 'typeorm';
import { UserCardEntity } from '../../entities/user-card.entity';
import { CardBrand } from '../types/card-brand.enum';

@Entity({ name: 'user_cards' })
export class UserCardDto extends UserCardEntity {
  @ApiProperty({ enum: CardBrand })
  brand: CardBrand;

  @ApiProperty()
  country: string;

  @ApiProperty()
  expMonth: string;

  @ApiProperty()
  expYear: string;

  @ApiProperty()
  funding: string;

  @ApiProperty()
  last4: string;

  @ApiProperty()
  network: string;

  constructor(ent: UserCardEntity) {
    super();

    Object.assign(this, ent);
  }
}
