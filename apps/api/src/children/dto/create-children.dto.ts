import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChildrenDto {
  @ApiProperty({
    description: 'User ID of the parent/guardian',
    example: 1,
    type: 'integer',
  })
  @IsNumber({}, { message: 'User ID must be a number' })
  @IsNotEmpty({ message: 'User ID is required' })
  user_id: number;

  @ApiProperty({
    description: 'Child date of birth (YYYY-MM-DD format)',
    example: '2015-06-15',socia
    format: 'date',
  })
  @IsDateString({}, { message: 'Date of birth must be a valid date string' })
  @IsNotEmpty({ message: 'Date of birth is required' })
  dob: string;

  @ApiPropertyOptional({
    description: 'Child profile photo URL',
    example: 'https://example.com/photos/child.jpg',
    maxLength: 500,
  })
  @IsString({ message: 'Photo URL must be a string' })
  @IsOptional()
  photo_url?: string;

  @ApiPropertyOptional({
    description: 'Parent first name',
    example: 'Jane',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Parent first name must be a string' })
  @IsOptional()
  @MinLength(2, {
    message: 'Parent first name must be at least 2 characters long',
  })
  @MaxLength(50, { message: 'Parent first name cannot exceed 50 characters' })
  parent_first_name?: string;

  @ApiPropertyOptional({
    description: 'Parent last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Parent last name must be a string' })
  @IsOptional()
  @MinLength(2, {
    message: 'Parent last name must be at least 2 characters long',
  })
  @MaxLength(50, { message: 'Parent last name cannot exceed 50 characters' })
  parent_last_name?: string;

  @ApiPropertyOptional({
    description: 'Location ID where the child trains',
    example: 1,
    type: 'integer',
  })
  @IsNumber({}, { message: 'Location ID must be a number' })
  @IsOptional()
  location_id?: number;
}
