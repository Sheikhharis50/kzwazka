import { Module } from '@nestjs/common';
import { CoachService } from './coach.service';
import { CoachController } from './coach.controller';
import { DbModule } from '../db/db.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DbModule, UserModule],
  controllers: [CoachController],
  providers: [CoachService],
  exports: [CoachService],
})
export class CoachModule {}
