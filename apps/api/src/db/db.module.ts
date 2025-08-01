import { Module } from "@nestjs/common";
import { DrizzleService } from "./drizzle.service";

@Module({
  providers: [
    DrizzleService,
    {
      provide: 'DATABASE',
      useFactory: (drizzleService: DrizzleService) => drizzleService.db,
      inject: [DrizzleService],
    },
  ],
  exports: [DrizzleService, 'DATABASE'],
})
export class DbModule {}