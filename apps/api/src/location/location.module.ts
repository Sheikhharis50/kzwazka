import { Module } from '@nestjs/common';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';
import { DbModule } from 'src/db/db.module';
import { FileStorageService } from '../services/file-storage.service';

@Module({
  imports: [DbModule],
  controllers: [LocationController],
  providers: [LocationService, FileStorageService],
})
export class LocationModule {}
