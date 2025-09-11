import { IsArray, IsInt, IsNotEmpty, Min, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChildrenGroupDto {
  @ApiProperty({
    description: 'Array of Children IDs',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray({ message: 'Children IDs must be an array' })
  @ArrayMinSize(1, { message: 'At least one children ID is required' })
  @IsInt({ each: true, message: 'Each children ID must be an integer' })
  @Min(1, { each: true, message: 'Each children ID must be at least 1' })
  @IsNotEmpty({ each: true, message: 'Each children ID is required' })
  children_ids: number[];

  @ApiProperty({
    description: 'Group ID',
    example: 1,
  })
  @IsInt({ message: 'Group ID must be an integer' })
  @Min(1, { message: 'Group ID must be at least 1' })
  @IsNotEmpty({ message: 'Group ID is required' })
  group_id: number;
}
