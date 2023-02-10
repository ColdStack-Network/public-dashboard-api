import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthnodeApiService } from '../../authnode-api/authnode-api.service';
import { IUser } from '../../authnode-api/interfaces/user.interface';

const matchRoles = (roles: string[], userRole: string) =>
  roles.includes(userRole);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly authnodeReq: AuthnodeApiService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles =
      this.reflector.get<string[]>('roles', context.getHandler()) ||
      this.reflector.get<string[]>('roles', context.getClass());

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    request.user =
      request.user ||
      (await this.authnodeReq.getAuthData(request.headers.authorization));

    const user = request.user as IUser;

    return matchRoles(roles, user?.role);
  }
}
