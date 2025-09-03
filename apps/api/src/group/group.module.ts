import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { DbModule } from '../db/db.module';
import { FileStorageService } from '../services/file-storage.service';

@Module({
  imports: [DbModule],
  controllers: [GroupController],
  providers: [GroupService, FileStorageService],
  exports: [GroupService],
})
export class GroupModule {}
