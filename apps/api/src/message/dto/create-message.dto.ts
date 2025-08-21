import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Message content',
    example: 'Training session cancelled due to weather conditions',
    maxLength: 1000,
  })
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  @MaxLength(1000, { message: 'Content cannot exceed 1000 characters' })
  content: string;

  @ApiProperty({
    description: 'Type of message content',
    example: 'text',
  })
  @IsString({ message: 'Content type must be a string' })
  @IsNotEmpty({ message: 'Content type is required' })
  content_type: string;

  @ApiPropertyOptional({
    description:
      'Group ID to send message to. If not provided, message will be sent to all groups (public announcement)',
    example: 1,
    type: Number,
  })
  @IsOptional()
  group_id?: number;
}
