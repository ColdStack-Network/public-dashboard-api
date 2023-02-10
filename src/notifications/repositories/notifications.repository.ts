import { EntityRepository, IsNull, Not, Repository } from 'typeorm';
import { NotificationEntity } from '../../entities/notification.entity';

@EntityRepository(NotificationEntity)
export class NotificationsRepository extends Repository<NotificationEntity> {
  async getOverallStatistics(
    userId: string,
  ): Promise<{ readCount: number; unreadCount: number; totalCount: number }> {
    const [unreadCount, readCount] = await Promise.all([
      this.count({
        where: {
          readAt: IsNull(),
          userId: userId,
        },
      }),
      this.count({
        where: {
          readAt: Not(IsNull()),
          userId: userId,
        },
      }),
    ]);

    return {
      readCount,
      unreadCount,
      totalCount: readCount + unreadCount,
    };
  }
}
