import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { UserStatus } from '../../../authnode-api/types/user-status.enum';

export class GetUsersQueryDto {
  @ApiPropertyOptional()
  searchValue?: string;

  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  perPage?: number;

  @ApiPropertyOptional({
    enum: UserStatus,
    description:
      'Категория транзакций. Если нужны все пользователи - all или пустое значение.' +
      'Если нужна сортировка по статусу, то выставить значения trial | active | expired | payment_required | unsubscribed | suspended | blocked | deleted',
  })
  @IsIn(Object.values(UserStatus))
  group?: UserStatus & 'all';

  @ApiPropertyOptional({
    enum: ['ASC', 'DESC', ''],
    description: 'Тип сортировки. По умолчанию DESC',
  })
  order?: 'ASC' | 'DESC';

  @ApiPropertyOptional({
    enum: [
      'name',
      'email',
      'createdAt',
      'filesCount',
      'filesSize',
      'openTicketsCount',
    ],
  })
  orderBy?:
    | 'name'
    | 'email'
    | 'createdAt'
    | 'filesCount'
    | 'filesSize'
    | 'openTicketsCount'
    | '';

  @ApiPropertyOptional({
    enum: ['true', 'false'],
    description: 'Получение списка только корпоративных клиентов',
  })
  corporateOnly?: 'true' | 'false' | '';
}
