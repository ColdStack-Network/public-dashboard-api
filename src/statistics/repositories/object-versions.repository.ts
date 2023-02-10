import { EntityRepository, Repository } from 'typeorm';
import { ObjectVersionEntity } from '../entities/object-version.filenode-entity';

@EntityRepository(ObjectVersionEntity)
export class ObjectVersionsRepository extends Repository<ObjectVersionEntity> {
  async getObjectVersionsSizeSumInBucketIds(
    bucketIds: string[],
  ): Promise<string> {
    if (!bucketIds.length) {
      return '0';
    }

    const resultFromDb: { sum: string } = await this.createQueryBuilder(
      'objects',
    )
      .select('sum(size)')
      .where('"bucketId" IN (:...bucketIds)', { bucketIds })
      .getRawOne();

    return resultFromDb.sum;
  }

  async getAllObjectVersionsCountAndSizeSum(): Promise<{
    usedStorage: string;
    objectsCount: string;
  }> {
    const result: { sum: string | null; count: string } =
      await this.createQueryBuilder('objects')
        .select('SUM(size) as sum, COUNT(*) as count')
        .getRawOne();

    return {
      usedStorage: result.sum || '0',
      objectsCount: result.count,
    };
  }
}
