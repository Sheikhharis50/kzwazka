import { Module } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { LocationService } from './location.service';
import { DbModule } from '../db/db.module';

@Module({
  imports: [DbModule],
  controllers: [ChildrenController],
  providers: [ChildrenService, LocationService],
  exports: [ChildrenService, LocationService],
})
export class ChildrenModule {}
