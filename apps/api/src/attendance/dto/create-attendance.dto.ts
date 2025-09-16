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
import { ATTENDANCE_STATUS } from 'src/utils/constants';

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
    enum: Object.values(ATTENDANCE_STATUS),
  })
  @IsString({ message: 'Status must be a string' })
  @IsNotEmpty({ message: 'Status is required' })
  @IsIn(Object.values(ATTENDANCE_STATUS), {
    message: `Status must be one of: ${Object.values(ATTENDANCE_STATUS).join(
      ', '
    )}`,
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

export class MarkAllAsPresentDto {
  @ApiProperty({
    description: 'Group ID',
    example: 1,
  })
  @IsInt({ message: 'Group ID must be an integer' })
  @Min(1, { message: 'Group ID must be at least 1' })
  @IsNotEmpty({ message: 'Group ID is required' })
  group_id: number;

  @ApiProperty({
    description: 'Date',
    example: '2024-01-15',
  })
  @IsString({ message: 'Date must be a string' })
  @IsNotEmpty({ message: 'Date is required' })
  date: string;
}
