import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { MESSAGE_CONTENT_TYPE } from '../../utils/constants';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Training session cancelled due to weather conditions',
    maxLength: 1000,
  })
  @IsString({ message: 'Content must be a string' })
  @IsOptional({ message: 'Content is optional' })
  @MaxLength(1000, { message: 'Content cannot exceed 1000 characters' })
  content?: string;

  @ApiProperty({
    description: 'Type of message content',
    example: MESSAGE_CONTENT_TYPE.TEXT,
    enum: MESSAGE_CONTENT_TYPE,
  })
  @IsEnum(MESSAGE_CONTENT_TYPE, {
    message: 'Content type must be a valid enum value',
  })
  @IsNotEmpty({ message: 'Content type is required' })
  content_type: MESSAGE_CONTENT_TYPE;

  @ApiPropertyOptional({
    description:
      'Group ID to send message to. If not provided, message will be sent to all groups (public announcement)',
    example: 1,
    type: Number,
  })
  @IsOptional()
  group_id?: number;
}
