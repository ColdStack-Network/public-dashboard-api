import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { IUser } from '../../authnode-api/interfaces/user.interface';

export const CurrentUser = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<Request>();

    const currentUser = req['user'] as IUser;

    return currentUser;
  },
);
