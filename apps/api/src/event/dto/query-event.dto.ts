import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';

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
    description: 'Filter events by minimum age',
    example: 8,
  })
  @IsOptional()
  @IsInt({ message: 'Min age must be an integer' })
  @Min(0, { message: 'Min age cannot be negative' })
  min_age?: number;

  @ApiPropertyOptional({
    description: 'Filter events by maximum age',
    example: 16,
  })
  @IsOptional()
  @IsInt({ message: 'Max age must be an integer' })
  @Min(0, { message: 'Max age cannot be negative' })
  max_age?: number;

  @ApiPropertyOptional({
    description: 'Filter events from this date',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'From date must be a valid date string' })
  from_date?: string;
  @ApiPropertyOptional({
    description: 'Filter events until this date',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'To date must be a valid date string' })
  to_date?: string;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @IsString({ message: 'Page must be a string' })
  page?: string;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsString({ message: 'Limit must be a string' })
  limit?: string;
}
