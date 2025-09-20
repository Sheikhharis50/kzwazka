import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ChildrenInvoiceStatus } from '../../utils/constants';

export class CreateChildrenInvoiceDto {
  @ApiProperty({
    description: 'The id of the children',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  children_id: number;

  @ApiProperty({
    description: 'The id of the group',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  group_id: number;

  @ApiProperty({
    description: 'The amount of the invoice',
    example: 100,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'The status of the invoice',
    example: 'pending',
  })
  @IsEnum(ChildrenInvoiceStatus)
  @IsNotEmpty()
  status: ChildrenInvoiceStatus;

  @ApiProperty({
    description: 'The external id of the invoice',
    example: '1234567890',
  })
  @IsString()
  @IsNotEmpty()
  external_id: string;

  @ApiProperty({
    description: 'The metadata of the invoice',
    example: { key: 'value' },
    required: false,
  })
  @IsObject()
  @IsNotEmpty()
  metadata: Record<string, string>;
}
