import { Module } from "@nestjs/common";
import { DatabaseService } from "./drizzle.service";

@Module({
  providers: [
    DatabaseService,
    {
      provide: 'DATABASE',
      useFactory: (databaseService: DatabaseService) => databaseService.db,
      inject: [DatabaseService],
    },
  ],
  exports: [DatabaseService, 'DATABASE'],
})
export class DbModule {}