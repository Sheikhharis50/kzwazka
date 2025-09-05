import { Module } from '@nestjs/common';
import { ChildrenGroupService } from './children-group.service';
import { ChildrenGroupController } from './children-group.controller';
import { DbModule } from '../db/db.module';
import { GroupModule } from '../group/group.module';

@Module({
  imports: [DbModule, GroupModule],
  controllers: [ChildrenGroupController],
  providers: [ChildrenGroupService],
  exports: [ChildrenGroupService],
})
export class ChildrenGroupModule {}
