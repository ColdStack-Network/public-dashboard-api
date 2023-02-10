import { EntityRepository, Repository } from 'typeorm';
import { ObjectEntity } from '../entities/object.filenode-entity';

@EntityRepository(ObjectEntity)
export class ObjectRepository extends Repository<ObjectEntity> {
  async getOverallObjectsCountInBuckets(
    buckets: string[],
    excludeFolders = false,
  ): Promise<number> {
    if (!buckets.length) {
      return 0;
    }

    const qb = this.createQueryBuilder('object').where(
      'object.bucket in (:...buckets)',
      { buckets },
    );
    if (excludeFolders) {
      qb.andWhere(`object.type = 'file'`);
    }
    return await qb.getCount();
  }
}
