import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsDateString,
  IsPositive,
  IsOptional,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EVENT_TYPE } from '../../utils/constants';

export class CreateEventDto {
  @ApiProperty({
    description: 'Event title',
    example: 'Wrestling Training Camp',
    maxLength: 255,
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({
    description: 'Group ID where the event will take place',
    example: 1,
    type: Number,
  })
  @IsNotEmpty({ message: 'Group ID is required' })
  @IsInt({ message: 'Group ID must be an integer' })
  @IsPositive({ message: 'Group ID must be positive' })
  group_id: number;

  @ApiPropertyOptional({
    description: 'Location ID where the event will take place',
    example: 1,
    type: Number,
  })
  @IsInt({ message: 'Location ID must be an integer' })
  @IsPositive({ message: 'Location ID must be positive' })
  @IsOptional()
  location_id?: number;

  @ApiProperty({
    description: 'Start date and time of the event',
    example: '2024-12-25',
    format: 'date-time',
  })
  @IsDateString({}, { message: 'Start date must be a valid date string' })
  @IsNotEmpty({ message: 'Start date is required' })
  start_date: string;

  @ApiPropertyOptional({
    description: 'End date and time of the event',
    example: '2024-12-25',
    format: 'date-time',
  })
  @IsDateString({}, { message: 'End date must be a valid date string' })
  @IsOptional()
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Opening time of the event',
    example: '10:00',
    format: 'time',
  })
  @IsString({ message: 'Opening time must be a string' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Opening time must be in HH:MM format (24-hour)',
  })
  opening_time?: string;

  @ApiPropertyOptional({
    description: 'Closing time of the event',
    example: '17:00',
    format: 'time',
  })
  @IsString({ message: 'Closing time must be a string' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Closing time must be in HH:MM format (24-hour)',
  })
  closing_time?: string;

  @ApiPropertyOptional({
    description: 'Event type',
    example: EVENT_TYPE.TRAINING,
    enum: EVENT_TYPE,
    default: EVENT_TYPE.TRAINING,
  })
  @IsString({ message: 'Event type must be a string' })
  @IsOptional()
  event_type?: EVENT_TYPE;

  @ApiPropertyOptional({
    description: 'Coach ID',
    example: 1,
    type: Number,
  })
  @IsInt({ message: 'Coach ID must be an integer' })
  @IsPositive({ message: 'Coach ID must be positive' })
  @IsOptional()
  coach_id?: number;
}
