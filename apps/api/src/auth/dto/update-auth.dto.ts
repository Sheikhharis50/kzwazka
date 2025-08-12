import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SignUpDto } from './create-auth.dto';

export class UpdateAuthDto extends PartialType(SignUpDto) {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
    maxLength: 255,
  })
  email?: string;

  @ApiPropertyOptional({
    description:
      'User password (min 8 chars, must contain uppercase, lowercase, and number)',
    example: 'SecurePass123',
    minLength: 8,
    maxLength: 128,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
  })
  password?: string;

  @ApiPropertyOptional({
    description: 'User first name',
    example: 'John',
    minLength: 2,
    maxLength: 50,
  })
  first_name?: string;

  @ApiPropertyOptional({
    description: 'User last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  last_name?: string;

  @ApiPropertyOptional({
    description: 'User date of birth (YYYY-MM-DD format)',
    example: '1990-01-15',
    format: 'date',
  })
  dob?: string;

  @ApiPropertyOptional({
    description: 'User phone number (international format supported)',
    example: '+1-555-123-4567',
    maxLength: 20,
    pattern: '^\\+?[\\d\\s\\-\\(\\)]+$',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Parent first name',
    example: 'Jane',
    minLength: 2,
    maxLength: 50,
  })
  parent_first_name?: string;

  @ApiPropertyOptional({
    description: 'Parent last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  parent_last_name?: string;

  @ApiPropertyOptional({
    description: 'Profile photo URL',
    example: 'https://example.com/photos/profile.jpg',
    maxLength: 500,
  })
  photo_url?: string;
}
