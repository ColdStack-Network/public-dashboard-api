import { IUser } from '../../authnode-api/interfaces/user.interface';

export type UserUpdateDto = Partial<IUser> & { id: IUser['id'] };
