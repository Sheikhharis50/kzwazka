import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MinLength,
  IsString,
} from 'class-validator';
import { IsPasswordMatch } from '../decorators/password-match.decorator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
}

export class ResetPasswordDto {
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  token: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;

  @IsString({ message: 'Confirm password must be a string' })
  @IsNotEmpty({ message: 'Confirm password is required' })
  @IsPasswordMatch('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}
