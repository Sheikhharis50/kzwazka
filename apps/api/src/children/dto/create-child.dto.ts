import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateChildDto {
  @IsNumber({}, { message: 'User ID must be a number' })
  @IsNotEmpty({ message: 'User ID is required' })
  user_id: number;

  @IsDateString({}, { message: 'Date of birth must be a valid date string' })
  @IsNotEmpty({ message: 'Date of birth is required' })
  dob: string;

  @IsString({ message: 'Photo URL must be a string' })
  @IsOptional()
  photo_url?: string;

  @IsString({ message: 'Parent first name must be a string' })
  @IsOptional()
  @MinLength(2, {
    message: 'Parent first name must be at least 2 characters long',
  })
  @MaxLength(50, { message: 'Parent first name cannot exceed 50 characters' })
  parent_first_name?: string;

  @IsString({ message: 'Parent last name must be a string' })
  @IsOptional()
  @MinLength(2, {
    message: 'Parent last name must be at least 2 characters long',
  })
  @MaxLength(50, { message: 'Parent last name cannot exceed 50 characters' })
  parent_last_name?: string;

  @IsNumber({}, { message: 'Location ID must be a number' })
  @IsOptional()
  location_id?: number;
}
