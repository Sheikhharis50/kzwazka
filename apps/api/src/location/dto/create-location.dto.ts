import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateLocationDto {
  @IsString({ message: 'Name must be a string' })
  @IsOptional()
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(200, { message: 'Name cannot exceed 200 characters' })
  name?: string;

  @IsString({ message: 'Address1 must be a string' })
  @IsNotEmpty({ message: 'Address1 is required' })
  @MinLength(5, { message: 'Address1 must be at least 5 characters long' })
  @MaxLength(500, { message: 'Address1 cannot exceed 500 characters' })
  address1: string;

  @IsString({ message: 'Address2 must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'Address2 cannot exceed 500 characters' })
  address2?: string;

  @IsString({ message: 'City must be a string' })
  @IsNotEmpty({ message: 'City is required' })
  @MinLength(2, { message: 'City must be at least 2 characters long' })
  @MaxLength(100, { message: 'City cannot exceed 100 characters' })
  city: string;

  @IsString({ message: 'State must be a string' })
  @IsNotEmpty({ message: 'State is required' })
  @MinLength(2, { message: 'State must be at least 2 characters long' })
  @MaxLength(100, { message: 'State cannot exceed 100 characters' })
  state: string;

  @IsString({ message: 'Country must be a string' })
  @IsNotEmpty({ message: 'Country is required' })
  @MinLength(2, { message: 'Country must be at least 2 characters long' })
  @MaxLength(100, { message: 'Country cannot exceed 100 characters' })
  country: string;

  @IsString({ message: 'Opening time must be a string' })
  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Opening time must be in HH:MM format (24-hour)',
  })
  opening_time?: string;

  @IsString({ message: 'Closing time must be a string' })
  @IsOptional()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Closing time must be in HH:MM format (24-hour)',
  })
  closing_time?: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  @MaxLength(1000, { message: 'Description cannot exceed 1000 characters' })
  description?: string;

  @IsString({ message: 'Amount must be a string' })
  @IsOptional()
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: 'Amount must be a valid number with up to 2 decimal places',
  })
  amount?: string;

  @IsString({ message: 'External ID must be a string' })
  @IsOptional()
  @MaxLength(200, { message: 'External ID cannot exceed 200 characters' })
  external_id?: string;
}
