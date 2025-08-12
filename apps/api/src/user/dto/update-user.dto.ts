import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({
    description: 'User email address',
    example: 'john.doe@example.com',
    format: 'email',
    maxLength: 255,
  })
  email?: string;

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
    description:
      'User password (min 8 chars, must contain uppercase, lowercase, and number)',
    example: 'SecurePass123',
    minLength: 8,
    maxLength: 128,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
  })
  password?: string | null;

  @ApiPropertyOptional({
    description: 'User phone number (international format supported)',
    example: '+1-555-123-4567',
    maxLength: 20,
    pattern: '^\\+?[\\d\\s\\-\\(\\)]+$',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'User role identifier',
    example: 'user',
    maxLength: 50,
  })
  role_id?: string;

  @ApiPropertyOptional({
    description: 'Whether the user account is active',
    example: true,
    default: true,
  })
  is_active?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the user email is verified',
    example: false,
    default: false,
  })
  is_verified?: boolean;

  @ApiPropertyOptional({
    description: 'Google OAuth social ID',
    example: 'google_123456789',
    maxLength: 255,
  })
  google_social_id?: string;
}
