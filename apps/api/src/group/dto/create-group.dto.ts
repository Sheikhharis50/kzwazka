import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty({
    description: 'Group name',
    example: 'Advanced Wrestling Group',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @ApiPropertyOptional({
    description: 'Group description',
    example: 'Advanced level wrestling training for experienced students',
    maxLength: 500,
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Minimum age required for the group',
    example: 12,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({}, { message: 'Min age must be a number' })
  @Min(0, { message: 'Min age cannot be negative' })
  @Max(100, { message: 'Min age cannot exceed 100' })
  min_age: number;

  @ApiProperty({
    description: 'Maximum age allowed for the group',
    example: 18,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber({}, { message: 'Max age must be a number' })
  @Min(0, { message: 'Max age cannot be negative' })
  @Max(100, { message: 'Max age cannot exceed 100' })
  max_age: number;

  @ApiProperty({
    description: 'Skill level required for the group',
    example: 'intermediate',
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
  })
  @IsString({ message: 'Skill level must be a string' })
  @IsNotEmpty({ message: 'Skill level is required' })
  skill_level: string;

  @ApiProperty({
    description: 'Maximum number of students allowed in the group',
    example: 15,
    minimum: 1,
    maximum: 100,
  })
  @IsNumber({}, { message: 'Max group size must be a number' })
  @Min(1, { message: 'Max group size must be at least 1' })
  @Max(100, { message: 'Max group size cannot exceed 100' })
  max_group_size: number;

  @ApiPropertyOptional({
    description: 'Location ID where the group meets',
    example: 1,
    type: Number,
  })
  @IsNumber({}, { message: 'Location ID must be a number' })
  @IsOptional()
  location_id?: number;

  @ApiPropertyOptional({
    description: 'Coach ID assigned to the group',
    example: 1,
    type: Number,
  })
  @IsNumber({}, { message: 'Coach ID must be a number' })
  @IsOptional()
  coach_id?: number;
}
