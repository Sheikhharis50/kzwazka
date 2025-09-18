import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateInsuranceDto } from './create-insurance.dto';
import { INSURANCE_STATUS } from 'src/utils/constants';
import { IsEnum } from 'class-validator';

export class UpdateInsuranceDto extends PartialType(CreateInsuranceDto) {
  @ApiPropertyOptional({
    description: 'The status of the insurance',
    example: INSURANCE_STATUS.ACTIVE,
  })
  @IsEnum(INSURANCE_STATUS)
  status?: INSURANCE_STATUS;
}
