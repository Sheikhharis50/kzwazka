import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateChildDto } from './create-child.dto';

export class UpdateChildDto extends PartialType(CreateChildDto) {
  @ApiPropertyOptional({
    description: 'User ID of the parent/guardian',
    example: 1,
    type: 'integer',
  })
  user_id?: number;

  @ApiPropertyOptional({
    description: 'Child date of birth (YYYY-MM-DD format)',
    example: '2015-06-15',
    format: 'date',
  })
  dob?: string;

  @ApiPropertyOptional({
    description: 'Child profile photo URL',
    example: 'https://example.com/photos/child.jpg',
    maxLength: 500,
  })
  photo_url?: string;

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
    description: 'Location ID where the child trains',
    example: 1,
    type: 'integer',
  })
  location_id?: number;
}
