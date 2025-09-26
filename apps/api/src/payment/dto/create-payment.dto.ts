import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class SubscribeToGroupDto {
  @IsNumber()
  @ApiProperty({
    description: 'The ID of the group',
    example: 1,
  })
  group_id: number;

  @ApiProperty({
    description: 'The return URL',
    example: 'https://example.com',
  })
  @IsString()
  return_url: string;

  @ApiProperty({
    description: 'The success URL',
    example: 'https://example.com',
  })
  @IsString()
  success_url: string;

  @ApiProperty({
    description: 'The cancel URL',
    example: 'https://example.com',
  })
  @IsString()
  cancel_url: string;
}
