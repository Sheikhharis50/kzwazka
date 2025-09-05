import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class QueryGroupSessionDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: 'Page number',
    required: false,
    type: String,
    example: '1',
    default: '1',
  })
  page?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Limit number',
    required: false,
    type: String,
    example: '10',
    default: '10',
  })
  limit?: string;

  @ApiPropertyOptional({
    description: 'Sort by',
    required: false,
    type: String,
    example: 'start_time',
  })
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    required: false,
    type: String,
    example: 'desc',
    default: 'desc',
  })
  @IsOptional()
  order?: string;

  @ApiPropertyOptional({
    description: 'Group ID',
    name: 'group_id',
    required: false,
    type: Number,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  group_id?: number;
}
