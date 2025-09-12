import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';

export class QueryChildrenDto {
  @ApiPropertyOptional({
    description: 'Search children by name (parent first name or last name)',
    example: 'John',
  })
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by location ID',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Location ID must be an integer' })
  @Min(1, { message: 'Location ID must be at least 1' })
  location_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by group ID',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Group ID must be an integer' })
  @Min(1, { message: 'Group ID must be at least 1' })
  group_id?: number;

  @ApiPropertyOptional({
    description: 'Sort order',
    example: 'desc',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'Sort order must be either "asc" or "desc"',
  })
  sort_order?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Sort by field',
    example: 'created_at',
    enum: ['created_at', 'dob'],
    default: 'created_at',
  })
  @IsOptional()
  @IsIn(['created_at', 'dob'], {
    message: 'Sort by must be either "created_at" or "dob"',
  })
  sort_by?: 'created_at' | 'dob' = 'created_at';

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
  limit?: number = 10;
}
