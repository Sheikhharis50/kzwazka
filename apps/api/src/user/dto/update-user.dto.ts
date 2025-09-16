import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'First name must be a string' })
  @IsOptional()
  first_name?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  last_name?: string;

  @ApiPropertyOptional({
    description: 'User phone number (international format supported)',
    example: '+1-555-123-4567',
    maxLength: 20,
    pattern: '^\\+?[\\d\\s\\-\\(\\)]+$',
  })
  @IsString({ message: 'Phone number must be a string' })
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({
    description: 'User photo URL',
    example: 'https://example.com/photos/user.jpg',
    maxLength: 500,
  })
  @IsString({ message: 'Photo URL must be a string' })
  @IsOptional()
  photo_url?: string;
}
