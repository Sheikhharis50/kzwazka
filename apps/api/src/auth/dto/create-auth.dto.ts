import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsDateString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
    maxLength: 255,
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description:
      'User password (min 8 chars, must contain uppercase, lowercase, and number)',
    example: 'SecurePass123',
    minLength: 8,
    maxLength: 128,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  first_name: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  last_name: string;

  @ApiProperty({
    description: 'User date of birth (YYYY-MM-DD format)',
    example: '1990-01-15',
    format: 'date',
  })
  @IsDateString(
    {},
    { message: 'Date of birth must be a valid date string (YYYY-MM-DD)' }
  )
  @IsNotEmpty({ message: 'Date of birth is required' })
  dob: string;

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

  @ApiProperty({
    description: 'Parent first name',
    example: 'Jane',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Parent first name must be a string' })
  @IsNotEmpty({ message: 'Parent first name is required' })
  @MinLength(2, {
    message: 'Parent first name must be at least 2 characters long',
  })
  @MaxLength(50, { message: 'Parent first name cannot exceed 50 characters' })
  parent_first_name: string;

  @ApiProperty({
    description: 'Parent last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Parent last name must be a string' })
  @IsNotEmpty({ message: 'Parent last name is required' })
  @MinLength(2, {
    message: 'Parent last name must be at least 2 characters long',
  })
  @MaxLength(50, { message: 'Parent last name cannot exceed 50 characters' })
  parent_last_name: string;

  @ApiPropertyOptional({
    description: 'Profile photo URL',
    example: 'https://example.com/photos/profile.jpg',
    maxLength: 500,
  })
  @IsString({ message: 'Photo URL must be a string' })
  @IsOptional()
  photo_url?: string;
}
