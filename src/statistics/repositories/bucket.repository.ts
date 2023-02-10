import { EntityRepository, Repository } from 'typeorm';
import { BucketEntity } from '../entities/bucket.filenode-entity';

@EntityRepository(BucketEntity)
export class BucketRepository extends Repository<BucketEntity> {
  getByOwnerUserId(
    ownerUserId: string,
    params?: { take?: number; skip?: number },
  ): Promise<BucketEntity[]> {
    return this.find({
      where: {
        ownerUserId,
      },
      ...(params || {}),
      order: {
        name: 'ASC',
      },
    });
  }
}
