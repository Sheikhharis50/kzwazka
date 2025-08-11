import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiPropertyOptional({
    description: 'Location name',
    example: 'Downtown Wrestling Academy',
    minLength: 2,
    maxLength: 200,
  })
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(200, { message: 'Name cannot exceed 200 characters' })
  name?: string;

  @ApiProperty({
    description: 'Primary address line',
    example: '123 Main Street',
    minLength: 5,
    maxLength: 500,
  })
  @IsString({ message: 'Address1 must be a string' })
  @IsNotEmpty({ message: 'Address1 is required' })
  @MinLength(5, { message: 'Address1 must be at least 5 characters long' })
  @MaxLength(500, { message: 'Address1 cannot exceed 500 characters' })
  address1: string;

  @ApiPropertyOptional({
    description: 'Secondary address line (apartment, suite, etc.)',
    example: 'Suite 100',
    maxLength: 500,
  })
  @IsString({ message: 'Address2 must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Address2 cannot exceed 500 characters' })
  address2?: string;

  @ApiProperty({
    description: 'City name',
    example: 'New York',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'City must be a string' })
  @IsNotEmpty({ message: 'City is required' })
  @MinLength(2, { message: 'City must be at least 2 characters long' })
  @MaxLength(100, { message: 'City cannot exceed 100 characters' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value
  )
  city: string;

  @ApiProperty({
    description: 'State or province',
    example: 'NY',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'State must be a string' })
  @IsNotEmpty({ message: 'State is required' })
  @MinLength(2, { message: 'State must be at least 2 characters long' })
  @MaxLength(100, { message: 'State cannot exceed 100 characters' })
  state: string;

  @ApiProperty({
    description: 'Country name',
    example: 'USA',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Country must be a string' })
  @IsNotEmpty({ message: 'Country is required' })
  @MinLength(2, { message: 'Country must be at least 2 characters long' })
  @MaxLength(100, { message: 'Country cannot exceed 100 characters' })
  country: string;

  @ApiPropertyOptional({
    description: 'Opening time in HH:MM format (24-hour)',
    example: '09:00',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString({ message: 'Opening time must be a string' })
  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Opening time must be in HH:MM format (24-hour)',
  })
  opening_time?: string;

  @ApiPropertyOptional({
    description: 'Closing time in HH:MM format (24-hour)',
    example: '18:00',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString({ message: 'Closing time must be a string' })
  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Closing time must be in HH:MM format (24-hour)',
  })
  closing_time?: string;

  @ApiPropertyOptional({
    description: 'Location description',
    example: 'Professional wrestling training facility with multiple rings',
    maxLength: 1000,
  })
  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Training session cost (up to 2 decimal places)',
    example: '25.50',
    pattern: '^\\d+(\\.\\d{1,2})?$',
  })
  @IsString({ message: 'Amount must be a string' })
  @IsOptional()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'Amount must be a valid number with up to 2 decimal places',
  })
  amount?: string;

  @ApiPropertyOptional({
    description: 'External system identifier',
    example: 'EXT_LOC_001',
    maxLength: 200,
  })
  @IsString({ message: 'External ID must be a string' })
  @IsOptional()
  @MaxLength(200, { message: 'External ID cannot exceed 200 characters' })
  external_id?: string;

  @ApiPropertyOptional({
    description: 'Whether the location is currently active',
    example: true,
    default: true,
  })
  @IsBoolean({ message: 'Is active must be a boolean' })
  @IsOptional()
  is_active?: boolean;
}
