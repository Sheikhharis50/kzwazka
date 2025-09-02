import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MinLength,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({
    description: 'User email address for password reset',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Reset token received via email',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    maxLength: 500,
  })
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  token: string;

  @ApiProperty({
    description:
      'New password (min 8 chars, must contain uppercase, lowercase, and number)',
    example: 'NewSecurePass123',
    minLength: 8,
    maxLength: 128,
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)',
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @ApiProperty({
    description: 'Confirm new password (must match password)',
    example: 'NewSecurePass123',
    minLength: 8,
    maxLength: 128,
  })
  @IsString({ message: 'Confirm password must be a string' })
  @IsNotEmpty({ message: 'Confirm password is required' })
  confirm_password: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Old password',
    example: 'OldSecurePass123',
  })
  @IsString({ message: 'Old password must be a string' })
  @IsNotEmpty({ message: 'Old password is required' })
  old_password: string;

  @ApiProperty({
    description: 'New password',
    example: 'NewSecurePass123',
    minLength: 8,
    maxLength: 128,
  })
  @IsString({ message: 'New password must be a string' })
  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'New password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  new_password: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'NewSecurePass123',
  })
  @IsString({ message: 'Confirm new password must be a string' })
  @IsNotEmpty({ message: 'Confirm new password is required' })
  confirm_password: string;
}
