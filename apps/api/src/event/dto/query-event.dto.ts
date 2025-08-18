import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsDateString,
  IsIn,
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
    description: 'Filter events by status',
    example: 'active',
    enum: ['active', 'inactive', 'cancelled', 'completed', 'draft'],
  })
  @IsOptional()
  @IsIn(['active', 'inactive', 'cancelled', 'completed', 'draft'], {
    message:
      'Status must be one of: active, inactive, cancelled, completed, draft',
  })
  status?: string;

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
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'From date must be a valid date string' })
  from_date?: string;
  @ApiPropertyOptional({
    description: 'Filter events until this date',
    example: '2024-12-31T23:59:59Z',
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
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Min(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;
}
