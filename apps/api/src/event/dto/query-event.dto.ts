import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt } from 'class-validator';

export class QueryEventDto {
  @ApiPropertyOptional({
    description: 'Search events by title',
    example: 'wrestling',
  })
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter events by group ID',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Group ID must be an integer' })
  group_id?: number;

  @ApiPropertyOptional({
    description: 'Filter events by location ID',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Location ID must be an integer' })
  location_id?: number;

  @ApiPropertyOptional({
    description: 'Filter events by date',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsString({ message: 'Date must be a string' })
  date?: string;
}
