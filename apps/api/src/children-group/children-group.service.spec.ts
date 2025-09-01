import { Test, TestingModule } from '@nestjs/testing';
import { ChildrenGroupService } from './children-group.service';

describe('ChildrenGroupService', () => {
  let service: ChildrenGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChildrenGroupService],
    }).compile();

    service = module.get<ChildrenGroupService>(ChildrenGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
