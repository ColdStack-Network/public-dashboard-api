import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationEntity } from '../../entities/notification.entity';

export class GetNotificationsResponseDto {
  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  perPage?: number;

  @ApiPropertyOptional()
  pagesCount?: number;

  @ApiPropertyOptional({ enum: ['all', 'read', 'unread'] })
  group?: 'all' | 'read' | 'unread';

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  readCount: number;

  @ApiProperty()
  unreadCount: number;

  @ApiProperty({ type: () => NotificationEntity, isArray: true })
  items: NotificationEntity[];

  constructor(data: GetNotificationsResponseDto) {
    Object.assign(this, data);
  }
}
