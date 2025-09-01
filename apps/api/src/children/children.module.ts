import { Module } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { DbModule } from '../db/db.module';
import {
  DigitalOceanService,
  EmailService,
  FileStorageService,
} from '../services';
import { SharedJwtModule } from '../auth/jwt.module';

@Module({
  imports: [DbModule, SharedJwtModule],
  controllers: [ChildrenController],
  providers: [
    ChildrenService,
    EmailService,
    FileStorageService,
    DigitalOceanService,
  ],
  exports: [ChildrenService],
})
export class ChildrenModule {}
