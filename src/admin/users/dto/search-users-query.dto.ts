import { ApiPropertyOptional } from '@nestjs/swagger';

export class SearchUsersQueryDto {
  @ApiPropertyOptional({
    enum: ['name', 'email', ''],
    description:
      'Поиск пользователей по name или email. По умолчанию возвращаются все пользователи',
  })
  by?: 'name' | 'email' | '';

  @ApiPropertyOptional()
  value?: string;
}
