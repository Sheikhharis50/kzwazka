import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenGroupController } from './children-group.controller';
import { ChildrenGroupService } from './children-group.service';

describe('ChildrenGroupController', () => {
  let controller: ChildrenGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChildrenGroupController],
      providers: [ChildrenGroupService],
    }).compile();

    controller = module.get<ChildrenGroupController>(ChildrenGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
