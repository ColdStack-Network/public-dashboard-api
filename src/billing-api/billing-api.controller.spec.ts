import { Test, TestingModule } from '@nestjs/testing';
import { BillingApiController } from './billing-api.controller';

describe('BillingApiController', () => {
  let controller: BillingApiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingApiController],
    }).compile();

    controller = module.get<BillingApiController>(BillingApiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
