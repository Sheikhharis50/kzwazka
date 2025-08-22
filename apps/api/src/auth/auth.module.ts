import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthController } from './auth.controller';
import { DbModule } from '../db/db.module';
import { UserModule } from '../user/user.module';
import { ChildrenModule } from '../children/children.module';
import { EmailService } from '../services/email.service';
import { GoogleAuthService } from './google-auth.service';

@Module({
  imports: [
    DbModule,
    UserModule,
    ChildrenModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('ACCESS_TOKEN_EXPIRY', '1h'),
        },
      }),
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailService, JwtStrategy, GoogleAuthService],
  exports: [AuthService],
})
export class AuthModule {}
