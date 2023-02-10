import { IsEnum, IsString } from 'class-validator';
import { UserRole } from '../../authnode-api/types/user-role.enum';
import { MetaProperty } from '../../common/decorators/meta-propery.decorator';
import { UserDto } from './dto/user.dto';

export class UserDao extends UserDto {
  @MetaProperty({ required: true })
  @IsString()
  password: string;

  @MetaProperty()
  @IsEnum(UserRole)
  role: UserRole;
}
