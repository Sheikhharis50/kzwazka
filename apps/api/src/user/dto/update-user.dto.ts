import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
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
    description: 'User phone number (international format supported)',
    example: '+1-555-123-4567',
    maxLength: 20,
    pattern: '^\\+?[\\d\\s\\-\\(\\)]+$',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'User photo URL',
    example: 'https://example.com/photos/user.jpg',
    maxLength: 500,
  })
  photo_url?: string;
}
