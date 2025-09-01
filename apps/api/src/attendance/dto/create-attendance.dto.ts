import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  IsDateString,
  IsIn,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty({
    description: 'Children ID',
    example: 1,
  })
  @IsInt({ message: 'Children ID must be an integer' })
  @Min(1, { message: 'Children ID must be at least 1' })
  children_id: number;

  @ApiProperty({
    description: 'Group ID',
    example: 1,
  })
  @IsInt({ message: 'Group ID must be an integer' })
  @Min(1, { message: 'Group ID must be at least 1' })
  group_id: number;

  @ApiProperty({
    description: 'Attendance date',
    example: '2024-01-15T09:00:00Z',
  })
  @IsDateString({}, { message: 'Date must be a valid date string' })
  @IsNotEmpty({ message: 'Date is required' })
  date: string;

  @ApiProperty({
    description: 'Attendance status',
    example: 'present',
    enum: ['present', 'absent', 'late'],
  })
  @IsString({ message: 'Status must be a string' })
  @IsNotEmpty({ message: 'Status is required' })
  @IsIn(['present', 'absent', 'late'], {
    message: 'Status must be one of: present, absent, late',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Additional notes about attendance',
    example: 'Arrived 5 minutes late due to traffic',
    maxLength: 500,
  })
  @IsString({ message: 'Notes must be a string' })
  @IsOptional()
  notes?: string;
}
