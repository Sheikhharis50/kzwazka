import { forwardRef, Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { DbModule } from '../db/db.module';
import { FileStorageService } from '../services/file-storage.service';
import { GroupSessionService } from './groupSession.service';
import { ChildrenModule } from '../children/children.module';

@Module({
  imports: [DbModule, forwardRef(() => ChildrenModule)],
  controllers: [GroupController],
  providers: [GroupService, FileStorageService, GroupSessionService],
  exports: [GroupService, GroupSessionService],
})
export class GroupModule {}
