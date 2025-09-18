import { Module } from '@nestjs/common';
import { InsuranceService } from './insurance.service';
import { InsuranceController } from './insurance.controller';
import { ChildrenModule } from '../children/children.module';
import { DbModule } from '../db/db.module';
import { FileStorageService } from '../services/file-storage.service';

@Module({
  imports: [ChildrenModule, DbModule],
  controllers: [InsuranceController],
  providers: [InsuranceService, FileStorageService],
})
export class InsuranceModule {}
