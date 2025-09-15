import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { DbModule } from '../db/db.module';
import { FileStorageService } from '../services/file-storage.service';

@Module({
  imports: [DbModule],
  controllers: [AttendanceController],
  providers: [AttendanceService, FileStorageService],
  exports: [AttendanceService],
})
export class AttendanceModule {}
