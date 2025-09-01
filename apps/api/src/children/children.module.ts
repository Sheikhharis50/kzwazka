import { Module } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { DbModule } from '../db/db.module';
import { EmailService, FileStorageService } from '../services';
import { SharedJwtModule } from '../auth/jwt.module';
import { UserService } from '../user/user.service';

@Module({
  imports: [DbModule, SharedJwtModule],
  controllers: [ChildrenController],
  providers: [ChildrenService, EmailService, FileStorageService, UserService],
  exports: [ChildrenService],
})
export class ChildrenModule {}
