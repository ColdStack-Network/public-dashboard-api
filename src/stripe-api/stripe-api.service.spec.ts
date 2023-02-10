import { Test, TestingModule } from '@nestjs/testing';
import { StripeApiService } from './stripe-api.service';

describe('StripeApiService', () => {
  let service: StripeApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripeApiService],
    }).compile();

    service = module.get<StripeApiService>(StripeApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
