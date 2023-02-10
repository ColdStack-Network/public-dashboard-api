import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../../authnode-api/types/user-status.enum';

export class NewUserStatusDto {
  @ApiProperty({ enum: UserStatus })
  userStatus: UserStatus;

  constructor(userStatus: UserStatus) {
    this.userStatus = userStatus;
  }
}
