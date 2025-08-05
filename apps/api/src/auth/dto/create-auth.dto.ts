import { IsEmail, IsString, IsNotEmpty, IsDateString, MinLength, MaxLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class SignUpDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' 
  })
  password: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  first_name: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  last_name: string;

  @IsDateString({}, { message: 'Date of birth must be a valid date string (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Date of birth is required' })
  @Transform(({ value }) => {
    // Ensure we get a proper date string
    if (typeof value === 'string') {
      const datePart = value.split('T')[0]; // Take only the date part if it's a full ISO string
      
      // Validate that the date is not in the future
      const inputDate = new Date(datePart);
      const today = new Date();
      if (inputDate > today) {
        return null;
      }
      
      // Validate that the person is not too old (e.g., over 120 years)
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 120);
      if (inputDate < minDate) {
        return null;
      }
      
      return datePart;
    }
    return value;
  })
  dob: string;

  @IsString({ message: 'Parent first name must be a string' })
  @IsNotEmpty({ message: 'Parent first name is required' })
  @MinLength(2, { message: 'Parent first name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Parent first name cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  parent_first_name: string;

  @IsString({ message: 'Parent last name must be a string' })
  @IsNotEmpty({ message: 'Parent last name is required' })
  @MinLength(2, { message: 'Parent last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Parent last name cannot exceed 50 characters' })
  @Transform(({ value }) => value?.trim())
  parent_last_name: string;
}