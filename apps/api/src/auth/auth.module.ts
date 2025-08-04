import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

import { GoogleStrategy } from './strategies/google-oauth-strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { AuthController } from './auth.controller';
import { DbModule } from 'src/db/db.module';
import { UserModule } from '../user/user.module';
import { ChildrenModule } from '../children/children.module';
import { AppService } from '../app.service';

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
        secret: configService.get<string>('JWT_SECRET') || 'fallback-secret-key',
        signOptions: { expiresIn: '1h' },
      }),
    }),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AppService, GoogleStrategy, JwtStrategy, GoogleOAuthGuard],
  exports: [AuthService, GoogleOAuthGuard],
})
export class AuthModule {}