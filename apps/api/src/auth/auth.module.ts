import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';

import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { DbModule } from '../db/db.module';
import { UserModule } from '../user/user.module';
import { ChildrenModule } from '../children/children.module';
import { EmailService, FileStorageService } from '../services';
import { GoogleAuthService } from './google-auth.service';
import { SharedJwtModule } from './jwt.module';

@Module({
  imports: [
    DbModule,
    UserModule,
    ChildrenModule,
    PassportModule,
    SharedJwtModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailService,
    FileStorageService,
    JwtStrategy,
    GoogleAuthService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
