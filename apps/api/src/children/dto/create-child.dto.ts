import { IsString, IsNotEmpty, IsOptional, IsDateString, IsUUID, IsUrl, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateChildDto {
  @IsString({ message: 'User ID must be a string' })
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  user_id: string;

  @IsDateString({}, { message: 'Date of birth must be a valid date string' })
  @IsNotEmpty({ message: 'Date of birth is required' })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      const datePart = value.split('T')[0];
      
      // Validate that the date is not in the future
      const inputDate = new Date(datePart);
      const today = new Date();
      if (inputDate > today) {
        throw new Error('Date of birth cannot be in the future');
      }
      
      // Validate that the child is not too old (e.g., over 18 years for children)
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 18);
      if (inputDate < minDate) {
        throw new Error('Date of birth seems invalid for a child (person would be over 18 years old)');
      }
      
      return datePart;
    }
    return value;
  })
  dob: string;

  @IsString({ message: 'Photo URL must be a string' })
  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid URL for the photo' })
  @Transform(({ value }) => value?.trim())
  photo_url?: string;

  @IsString({ message: 'Parent first name must be a string' })
  @IsOptional()
  @MinLength(2, { message: 'Parent first name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Parent first name cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  parent_first_name?: string;

  @IsString({ message: 'Parent last name must be a string' })
  @IsOptional()
  @MinLength(2, { message: 'Parent last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Parent last name cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  parent_last_name?: string;

  @IsString({ message: 'Location ID must be a string' })
  @IsOptional()
  @IsUUID(4, { message: 'Location ID must be a valid UUID' })
  location_id?: string;
}
