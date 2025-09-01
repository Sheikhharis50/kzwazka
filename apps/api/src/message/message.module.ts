import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { DbModule } from '../db/db.module';
import { FileStorageService } from '../services';

@Module({
  imports: [DbModule],
  controllers: [MessageController],
  providers: [MessageService, FileStorageService],
})
export class MessageModule {}
