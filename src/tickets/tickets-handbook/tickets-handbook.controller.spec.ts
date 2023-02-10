import { Test, TestingModule } from '@nestjs/testing';
import { TicketsHandbookController } from './tickets-handbook.controller';

describe('TicketsHandbookController', () => {
  let controller: TicketsHandbookController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsHandbookController],
    }).compile();

    controller = module.get<TicketsHandbookController>(
      TicketsHandbookController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
