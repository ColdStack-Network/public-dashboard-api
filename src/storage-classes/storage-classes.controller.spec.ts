import { Test, TestingModule } from '@nestjs/testing';
import { StorageClassesController } from './storage-classes.controller';

describe('StorageClassesController', () => {
  let controller: StorageClassesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StorageClassesController],
    }).compile();

    controller = module.get<StorageClassesController>(StorageClassesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
