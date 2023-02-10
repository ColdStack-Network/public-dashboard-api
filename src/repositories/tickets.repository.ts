import { EntityRepository, Repository } from 'typeorm';
import { TicketsEntity } from '../entities/tickets.entity';

@EntityRepository(TicketsEntity)
export class TicketsRepository extends Repository<TicketsEntity> {}
