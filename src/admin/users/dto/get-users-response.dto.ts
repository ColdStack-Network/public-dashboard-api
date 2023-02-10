import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '../../../authnode-api/types/user-status.enum';
import { MetaProperty } from '../../../common/decorators/meta-propery.decorator';
import { CompanyDto } from './CompanyDto';
import { UserDto } from './user.dto';

export class GetUsersResponseDto {
  @ApiPropertyOptional()
  page?: number;

  @ApiPropertyOptional()
  perPage?: number;

  @ApiPropertyOptional()
  pagesCount?: number;

  @ApiPropertyOptional({ enum: [Object.values(UserStatus)] })
  group?: UserStatus;

  @ApiProperty()
  totalCount: number;

  @ApiProperty()
  trialCount: number;

  @ApiProperty()
  activeCount: number;

  @ApiProperty()
  expiredCount: number;

  @ApiProperty()
  paymentRequiredCount: number;

  @ApiProperty()
  unsubscribedCount: number;

  @ApiProperty()
  suspendedCount: number;

  @ApiProperty()
  blockedCount: number;

  @ApiProperty()
  deletedCount: number;

  @ApiProperty({ type: () => UserDto, isArray: true })
  items: UserDto[];

  @MetaProperty()
  company?: CompanyDto;

  constructor(data: GetUsersResponseDto) {
    Object.assign(this, data);
  }
}
