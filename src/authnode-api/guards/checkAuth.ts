import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { APP_CONFIGS_KEY, TAppConfigs } from '../../common/config';
import { AuthnodeApiService } from '../authnode-api.service';

@Injectable()
export class IsAuth implements CanActivate {
  constructor(private readonly authnodeReq: AuthnodeApiService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    if (!request.headers.authorization) {
      throw new HttpException(
        '`Authorization` in header not found',
        HttpStatus.FORBIDDEN,
      );
    }

    const user =
      request.user ||
      (await this.authnodeReq.getAuthData(request.headers.authorization));

    request.user = user;
    return true;
  }
}

@Injectable()
export class XApiToken implements CanActivate {
  constructor(
    @Inject(APP_CONFIGS_KEY)
    private readonly appConfigs: TAppConfigs,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const { headers } = request;
    const reqApiToken = headers['x-api-token'];
    return this.appConfigs.xApiKey === reqApiToken;
  }
}
