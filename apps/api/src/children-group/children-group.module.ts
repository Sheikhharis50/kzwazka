import { Module } from '@nestjs/common';
import { ChildrenGroupService } from './children-group.service';
import { ChildrenGroupController } from './children-group.controller';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [ChildrenGroupController],
  providers: [ChildrenGroupService],
  exports: [ChildrenGroupService],
})
export class ChildrenGroupModule {}
