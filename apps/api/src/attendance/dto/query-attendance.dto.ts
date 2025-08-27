import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, IsDateString, IsIn } from 'class-validator';

export class QueryAttendanceDto {
  @ApiPropertyOptional({
    description: 'Filter attendance by children ID',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Children ID must be an integer' })
  @Min(1, { message: 'Children ID must be at least 1' })
  children_id?: number;

  @ApiPropertyOptional({
    description: 'Filter attendance by group ID',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Group ID must be an integer' })
  @Min(1, { message: 'Group ID must be at least 1' })
  group_id?: number;

  @ApiPropertyOptional({
    description: 'Filter attendance by status',
    example: 'present',
    enum: ['present', 'absent', 'late'],
  })
  @IsOptional()
  @IsIn(['present', 'absent', 'late'], {
    message: 'Status must be one of: present, absent, late',
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter attendance from this date',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'From date must be a valid date string' })
  from_date?: string;

  @ApiPropertyOptional({
    description: 'Filter attendance until this date',
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
