import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryCoachDto {
  @ApiPropertyOptional({
    description: 'Search query',
    example: 'John',
  })
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
  })
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({
    description: 'Limit number',
    example: 10,
  })
  @IsOptional()
  limit?: string;
}
