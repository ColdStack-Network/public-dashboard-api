import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class GetNotificationsRequestQueryDto {
  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  perPage?: number;

  @ApiPropertyOptional({
    enum: ['all', 'read', 'unread'],
    description:
      'Категория уведомлений. если нужно получать только непрочитанные ' +
      'то можно указать read, иначе unread, если нужны все уведомления - all, ' +
      'или просто оставить этот параметр пустым.',
  })
  @IsIn(['all', 'read', 'unread', ''])
  group?: 'all' | 'read' | 'unread' | '';

  @ApiPropertyOptional({
    description:
      'Получение страницы уведомлений на которой расположено уведомление по его id',
  })
  id?: number;
}
