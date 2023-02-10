import { Test, TestingModule } from '@nestjs/testing';
import { AuthnodeApiService } from './authnode-api.service';

describe('AuthnodeApiService', () => {
  let service: AuthnodeApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthnodeApiService],
    }).compile();

    service = module.get<AuthnodeApiService>(AuthnodeApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
