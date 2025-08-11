import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  IsNumber,
} from 'class-validator';

export class VerifyOtpDto {
  @IsString({ message: 'OTP must be a string' })
  @IsNotEmpty({ message: 'OTP is required' })
  @Length(6, 6, { message: 'OTP must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'OTP must contain only digits' })
  otp: string;
}

export class ResendOtpDto {
  @IsNumber({}, { message: 'User ID must be a number' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: number;
}
