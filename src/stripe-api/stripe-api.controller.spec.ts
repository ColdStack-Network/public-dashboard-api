import { Test, TestingModule } from '@nestjs/testing';
import { StripeApiController } from './stripe-api.controller';

describe('StripeApiController', () => {
  let controller: StripeApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StripeApiController],
    }).compile();

    controller = module.get<StripeApiController>(StripeApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
