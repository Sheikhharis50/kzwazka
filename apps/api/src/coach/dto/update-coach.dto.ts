import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCoachDto {
  @ApiPropertyOptional({
    description: 'Coach first name',
    example: 'John',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  first_name: string;

  @ApiPropertyOptional({
    description: 'Coach last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  last_name: string;

  @ApiPropertyOptional({
    description: 'Coach phone number',
    example: '+1234567890',
  })
  @IsString({ message: 'Phone must be a string' })
  @IsNotEmpty({ message: 'Phone is required' })
  phone: string;

  @ApiPropertyOptional({
    description: 'Location ID where the coach works',
    example: 1,
    type: 'number',
  })
  @IsOptional()
  @IsNumber({}, { message: 'Location ID must be a number' })
  location_id?: number;

  @ApiPropertyOptional({
    description: 'Coach profile photo URL',
    example: 'https://example.com/photos/coach.jpg',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Photo URL must be a string' })
  photo_url?: string;
}
