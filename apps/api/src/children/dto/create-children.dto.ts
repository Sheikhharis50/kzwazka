import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  MinLength,
  MaxLength,
  IsEmail,
  IsBoolean,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChildrenDto {
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
    description:
      'User password (min 8 chars, must contain uppercase, lowercase, and number)',
    example: 'SecurePass123',
    minLength: 8,
    maxLength: 128,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
  })
  @IsString({ message: 'Password must be a string' })
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password?: string | null;

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
    description: 'User role identifier',
    example: 'children',
    maxLength: 50,
  })
  @IsString({ message: 'Role ID must be a string' })
  @IsNotEmpty({ message: 'Role ID is required' })
  role_id: string;

  @ApiPropertyOptional({
    description: 'Whether the user account is active',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'Is active must be a boolean' })
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the user email is verified',
    example: false,
    default: false,
  })
  @IsBoolean({ message: 'Is verified must be a boolean' })
  @IsOptional()
  is_verified?: boolean;

  @ApiPropertyOptional({
    description: 'Google OAuth social ID',
    example: 'google_123456789',
    maxLength: 255,
  })
  @IsString({ message: 'Google social ID must be a string' })
  @IsOptional()
  google_social_id?: string;

  @ApiProperty({
    description: 'Child date of birth (YYYY-MM-DD format)',
    example: '2015-06-15',
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

export class CreateChildrenDtoByAdmin {
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
    description: 'User name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Name must be a string' })
  @IsNotEmpty({ message: 'Name is required' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Name cannot exceed 50 characters' })
  name: string;

  @ApiPropertyOptional({
    description:
      'User password (min 8 chars, must contain uppercase, lowercase, and number)',
    example: 'SecurePass123',
    minLength: 8,
    maxLength: 128,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
  })
  @IsString({ message: 'Password must be a string' })
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password?: string | null;

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
    description: 'User role identifier',
    example: 'children',
    maxLength: 50,
  })
  @IsString({ message: 'Role ID must be a string' })
  @IsNotEmpty({ message: 'Role ID is required' })
  role_id: string;

  @ApiPropertyOptional({
    description: 'Whether the user account is active',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'Is active must be a boolean' })
  @IsOptional()
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the user email is verified',
    example: false,
    default: false,
  })
  @IsBoolean({ message: 'Is verified must be a boolean' })
  @IsOptional()
  is_verified?: boolean;

  @ApiPropertyOptional({
    description: 'Google OAuth social ID',
    example: 'google_123456789',
    maxLength: 255,
  })
  @IsString({ message: 'Google social ID must be a string' })
  @IsOptional()
  google_social_id?: string;

  @ApiProperty({
    description: 'Child date of birth (YYYY-MM-DD format)',
    example: '2015-06-15',
    format: 'date',
  })
  @IsDateString({}, { message: 'Date of birth must be a valid date string' })
  @IsNotEmpty({ message: 'Date of birth is required' })
  dob: string;

  @ApiPropertyOptional({
    description: 'Parent name',
    example: 'Jane Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Parent name must be a string' })
  @IsOptional()
  @MinLength(2, {
    message: 'Parent name must be at least 2 characters long',
  })
  @MaxLength(50, { message: 'Parent name cannot exceed 50 characters' })
  parent_name?: string;

  @ApiPropertyOptional({
    description: 'Location ID where the child trains',
    example: 1,
    type: 'integer',
  })
  @IsNumber({}, { message: 'Location ID must be a number' })
  @IsOptional()
  location_id?: number;

  @ApiProperty({
    description: 'Group ID where the child belongs to',
    example: 1,
    type: 'integer',
  })
  @IsNumber({}, { message: 'Group ID must be a number' })
  @IsOptional()
  group_id?: number;
}
