import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { DbModule } from '../db/db.module';
import { DigitalOceanService, FileStorageService } from '../services';

@Module({
  imports: [DbModule],
  controllers: [UserController],
  providers: [UserService, FileStorageService, DigitalOceanService],
  exports: [UserService],
})
export class UserModule {}
