import { UserRole } from '../types/user-role.enum';
import { UserStatus } from '../types/user-status.enum';

export interface IUser {
  id: string;
  createdAt: string;
  email: string;
  emailVerified: boolean;
  name: string;
  status: UserStatus;
  hasStoredPassword: boolean;
  stripeCustomerId: string;
  role: UserRole;
  tariffId?: number;
  nextTariffId?: number;
  companyId?: number;
}
