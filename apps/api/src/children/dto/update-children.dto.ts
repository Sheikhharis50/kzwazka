import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  MinLength,
  MaxLength,
  IsEmail,
  Matches,
  Allow,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateChildrenDto {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
    maxLength: 255,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'First name must be a string' })
  @IsOptional()
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  first_name?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  last_name?: string;

  @ApiPropertyOptional({
    description: 'User phone number (international format supported)',
    example: '+1-555-123-4567',
    maxLength: 20,
    pattern: '^\\+?[\\d\\s\\-\\(\\)]+$',
  })
  @IsString({ message: 'Phone must be a string' })
  @IsOptional()
  @Matches(/^\+?[\d\s\-\\(\\)]+$/, {
    message: 'Please provide a valid phone number',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Child date of birth (YYYY-MM-DD format)',
    example: '2015-06-15',
    format: 'date',
  })
  @IsDateString({}, { message: 'Date of birth must be a valid date string' })
  @IsOptional()
  dob?: string;

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

  @Allow()
  @IsOptional()
  group_id?: number | null;
}
