import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

export class GetBillingTransactionsRequestQueryDto {
  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  perPage?: number;

  @ApiPropertyOptional({
    enum: ['all', 'success', 'pending', 'failed'],
    description:
      'Категория транзакций. Если нужны все уведомления - all или пустое значение.' +
      'Если нужна сортировка по статусу, то выставить значения success|pending|failed',
  })
  @IsIn(['all', 'success', 'pending', 'failed', ''])
  group?: 'all' | 'success' | 'pending' | 'failed' | '';

  @ApiPropertyOptional({
    description:
      'Получение страницы уведомлений на которой расположено уведомление по его id',
  })
  id?: number;
}
