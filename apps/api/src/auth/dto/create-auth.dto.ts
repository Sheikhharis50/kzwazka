import { IsEmail, IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class SignUpDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  first_name: string;

  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  last_name: string;

  @IsDateString({}, { message: 'Date of birth must be a valid date string (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'Date of birth is required' })
  @Transform(({ value }) => {
    // Ensure we get a proper date string
    if (typeof value === 'string') {
      return value.split('T')[0]; // Take only the date part if it's a full ISO string
    }
    return value;
  })
  dob: string;

  @IsString({ message: 'Parent first name must be a string' })
  @IsNotEmpty({ message: 'Parent first name is required' })
  parent_first_name: string;

  @IsString({ message: 'Parent last name must be a string' })
  @IsNotEmpty({ message: 'Parent last name is required' })
  parent_last_name: string;
}