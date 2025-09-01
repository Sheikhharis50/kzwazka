import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ChildrenModule } from './children/children.module';
import { LocationModule } from './location/location.module';
import { EventModule } from './event/event.module';
import { GroupModule } from './group/group.module';
import { CoachModule } from './coach/coach.module';
import { MessageModule } from './message/message.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AttendanceModule } from './attendance/attendance.module';
import { ChildrenGroupModule } from './children-group/children-group.module';
@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'media'),
      serveRoot: '/media',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    AuthModule,
    UserModule,
    ChildrenModule,
    LocationModule,
    EventModule,
    GroupModule,
    CoachModule,
    MessageModule,
    AttendanceModule,
    ChildrenGroupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
