import { Test, TestingModule } from '@nestjs/testing';
import { StorageClassesService } from './storage-classes.service';

describe('StorageClassesService', () => {
  let service: StorageClassesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StorageClassesService],
    }).compile();

    service = module.get<StorageClassesService>(StorageClassesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
