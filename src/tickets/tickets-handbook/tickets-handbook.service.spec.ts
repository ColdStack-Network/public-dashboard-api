import { Test, TestingModule } from '@nestjs/testing';
import { TicketsHandbookService } from './tickets-handbook.service';

describe('TicketsHandbookService', () => {
  let service: TicketsHandbookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TicketsHandbookService],
    }).compile();

    service = module.get<TicketsHandbookService>(TicketsHandbookService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
