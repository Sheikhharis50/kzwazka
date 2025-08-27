import { Module } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { DbModule } from '../db/db.module';
import { EmailService } from '../services/email.service';
import { SharedJwtModule } from '../auth/jwt.module';

@Module({
  imports: [DbModule, SharedJwtModule],
  controllers: [ChildrenController],
  providers: [ChildrenService, EmailService],
  exports: [ChildrenService],
})
export class ChildrenModule {}
