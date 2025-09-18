import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { INSURANCE_COVERAGE_TYPE } from 'src/utils/constants';

export class CreateInsuranceDto {
  @ApiProperty({
    description: 'The ID of the children',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  children_id: number;

  @ApiProperty({
    description: 'The name of the insurance',
    example: 'Insurance Name',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The policy ID of the insurance',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  policy_id: string;

  @ApiProperty({
    description: 'The start date of the insurance',
    example: '2025-01-01',
  })
  @IsNotEmpty()
  @IsDate()
  start_date: Date;

  @ApiProperty({
    description: 'The end date of the insurance',
    example: '2026-01-01',
  })
  @IsNotEmpty()
  @IsDate()
  end_date: Date;

  @ApiProperty({
    description: 'The coverage type of the insurance',
    example: INSURANCE_COVERAGE_TYPE.TRAINING_AND_TOURNAMENT,
  })
  @IsNotEmpty()
  @IsEnum(INSURANCE_COVERAGE_TYPE)
  coverage_type: INSURANCE_COVERAGE_TYPE;

  @ApiProperty({
    description: 'The content of the insurance',
    example: 'Insurance content',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: 'The coverage amount of the insurance',
    example: 10000,
  })
  @IsNotEmpty()
  @IsNumber()
  coverage_amount: number;
}
