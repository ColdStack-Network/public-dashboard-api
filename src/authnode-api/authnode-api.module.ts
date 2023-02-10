import { Module } from '@nestjs/common';
import { AuthnodeApiService } from './authnode-api.service';
import { IsAuth } from './guards/checkAuth';

@Module({
  providers: [AuthnodeApiService, IsAuth],
  exports: [AuthnodeApiService, IsAuth],
})
export class AuthnodeApiModule {}
