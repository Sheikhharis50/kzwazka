import { IsInt, IsOptional, Min, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateChildrenGroupDto {
  @ApiProperty({
    description: 'Children ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Children ID must be an integer' })
  @Min(1, { message: 'Children ID must be at least 1' })
  children_id?: number;

  @ApiProperty({
    description: 'Group ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'Group ID must be an integer' })
  @Min(1, { message: 'Group ID must be at least 1' })
  group_id?: number;

  @ApiProperty({
    description: 'Status of the relationship',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Status must be a boolean' })
  status?: boolean;
}
