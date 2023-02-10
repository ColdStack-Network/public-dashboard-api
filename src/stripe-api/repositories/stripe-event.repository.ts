import { EntityRepository, Repository } from 'typeorm';
import { StripeEventEntity } from '../entities/stripe-event.entity';

@EntityRepository(StripeEventEntity)
export class StripeEventRepository extends Repository<StripeEventEntity> {}
