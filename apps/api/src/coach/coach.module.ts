import { Module } from '@nestjs/common';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';
import { DbModule } from '../db/db.module';
import { UserModule } from '../user/user.module';
import { FileStorageService } from '../services';

@Module({
  imports: [DbModule, UserModule],
  controllers: [CoachController],
  providers: [CoachService, FileStorageService],
  exports: [CoachService],
})
export class CoachModule {}
