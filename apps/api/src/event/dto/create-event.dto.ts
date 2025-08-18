import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsIn,
  IsPositive,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({
    description: 'Event title',
    example: 'Wrestling Training Camp',
    maxLength: 255,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiPropertyOptional({
    description: 'Location ID where the event will take place',
    example: 1,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'Location ID must be an integer' })
  @IsPositive({ message: 'Location ID must be positive' })
  location_id?: number;

  @ApiProperty({
    description: 'Minimum age required for the event',
    example: 8,
    minimum: 0,
    maximum: 100,
  })
  @IsInt({ message: 'Minimum age must be an integer' })
  @Min(0, { message: 'Minimum age cannot be negative' })
  @Max(100, { message: 'Minimum age cannot exceed 100' })
  @Min(0, { message: 'Minimum age cannot be negative' })
  @Max(100, { message: 'Minimum age cannot exceed 100' })
  min_age: number;

  @ApiProperty({
    description: 'Maximum age allowed for the event',
    example: 16,
    minimum: 0,
    maximum: 100,
  })
  @IsInt({ message: 'Maximum age must be an integer' })
  @Min(0, { message: 'Maximum age cannot be negative' })
  @Max(100, { message: 'Maximum age cannot exceed 100' })
  max_age: number;

  @ApiProperty({
    description: 'Date and time of the event',
    example: '2024-12-25T10:00:00Z',
    format: 'date-time',
  })
  @IsDateString({}, { message: 'Event date must be a valid date string' })
  @IsNotEmpty({ message: 'Event date is required' })
  event_date: string;

  @ApiProperty({
    description: 'Opening time of the event',
    example: '2024-12-25T09:30:00Z',
    format: 'date-time',
  })
  @IsDateString({}, { message: 'Opening time must be a valid date string' })
  @IsNotEmpty({ message: 'Opening time is required' })
  opening_time: string;

  @ApiProperty({
    description: 'Closing time of the event',
    example: '2024-12-25T17:00:00Z',
    format: 'date-time',
  })
  @IsDateString({}, { message: 'Closing time must be a valid date string' })
  @IsNotEmpty({ message: 'Closing time is required' })
  closing_time: string;

  @ApiProperty({
    description: 'Event status',
    example: 'active',
    enum: ['active', 'inactive', 'cancelled', 'completed', 'draft'],
  })
  @IsString({ message: 'Status must be a string' })
  @IsNotEmpty({ message: 'Status is required' })
  @IsIn(['active', 'inactive', 'cancelled', 'completed', 'draft'], {
    message:
      'Status must be one of: active, inactive, cancelled, completed, draft',
  })
  status: string;

  @ApiProperty({
    description: 'Event participation fee amount in cents',
    example: 5000,
    minimum: 0,
  })
  @IsInt({ message: 'Amount must be an integer' })
  @Min(0, { message: 'Amount cannot be negative' })
  amount: number;
}
