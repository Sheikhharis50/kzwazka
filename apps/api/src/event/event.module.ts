import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { DbModule } from '../db/db.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DbModule, UserModule],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
