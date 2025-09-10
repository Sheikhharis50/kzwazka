import { Module } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { ChildrenGroupService } from './children-group.service';
import { DbModule } from '../db/db.module';
import { EmailService, FileStorageService } from '../services';
import { SharedJwtModule } from '../auth/jwt.module';
import { UserService } from '../user/user.service';
import { GroupModule } from '../group/group.module';

@Module({
  imports: [DbModule, SharedJwtModule, GroupModule],
  controllers: [ChildrenController],
  providers: [
    ChildrenService,
    ChildrenGroupService,
    EmailService,
    FileStorageService,
    UserService,
  ],
  exports: [ChildrenService, ChildrenGroupService],
})
export class ChildrenModule {}
