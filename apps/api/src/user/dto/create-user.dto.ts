import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
  IsNumber,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateUserDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

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

  @IsString({ message: 'Password must be a string' })
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password?: string | null;

  @IsString({ message: 'Phone must be a string' })
  @IsOptional()
  @Matches(/^\+?[\d\s\-\(\)]+$/, {
    message: 'Please provide a valid phone number',
  })
  @Transform(({ value }) => value?.trim())
  phone?: string;

  @IsNumber({}, { message: 'Role ID must be a number' })
  @IsNotEmpty({ message: 'Role ID is required' })
  @Type(() => Number)
  role_id: number;

  @IsBoolean({ message: 'Is active must be a boolean' })
  @IsOptional()
  is_active?: boolean;

  @IsBoolean({ message: 'Is verified must be a boolean' })
  @IsOptional()
  is_verified?: boolean;

  @IsString({ message: 'Google social ID must be a string' })
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  google_social_id?: string;
}
