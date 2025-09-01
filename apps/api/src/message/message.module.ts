import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { DbModule } from '../db/db.module';
import { FileStorageService, DigitalOceanService } from '../services';

@Module({
  imports: [DbModule],
  controllers: [MessageController],
  providers: [MessageService, FileStorageService, DigitalOceanService],
})
export class MessageModule {}
