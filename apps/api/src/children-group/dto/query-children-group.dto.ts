import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';

export class QueryChildrenGroupDto {
  @ApiPropertyOptional({
    description: 'Filter by children ID',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Children ID must be an integer' })
  @Min(1, { message: 'Children ID must be at least 1' })
  children_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by group ID',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Group ID must be an integer' })
  @Min(1, { message: 'Group ID must be at least 1' })
  group_id?: number;

  @ApiPropertyOptional({
    description: 'Filter by status',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Status must be a boolean' })
  status?: boolean;

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
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;
}
