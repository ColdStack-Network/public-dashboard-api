import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '../entities/user.authnode-entity';

export class SearchUsersResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  lastName: string;

  constructor(user: UserEntity) {
    const { id, name, lastName, email } = user;

    this.id = id;
    this.name = name;
    this.lastName = lastName;
    this.email = email;
  }
}
