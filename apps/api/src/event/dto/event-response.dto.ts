import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EventResponseDto {
  @ApiProperty({
    description: 'Unique event identifier',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Event title',
    example: 'Wrestling Training Camp',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Location ID where the event will take place',
    example: 1,
  })
  location_id?: number;

  @ApiProperty({
    description: 'Minimum age required for the event',
    example: 8,
  })
  min_age: number;

  @ApiProperty({
    description: 'Maximum age allowed for the event',
    example: 16,
  })
  max_age: number;

  @ApiProperty({
    description: 'Date and time of the event',
    example: '2024-12-25T10:00:00Z',
  })
  event_date: Date;

  @ApiProperty({
    description: 'Opening time of the event',
    example: '2024-12-25T09:30:00Z',
  })
  opening_time: Date;

  @ApiProperty({
    description: 'Closing time of the event',
    example: '2024-12-25T17:00:00Z',
  })
  closing_time: Date;

  @ApiProperty({
    description: 'Event status',
    example: 'active',
    enum: ['active', 'inactive', 'cancelled', 'completed', 'draft'],
  })
  status: string;

  @ApiProperty({
    description: 'User ID who created the event',
    example: 1,
  })
  created_by: number;

  @ApiProperty({
    description: 'Event participation fee amount in cents',
    example: 5000,
  })
  amount: number;

  @ApiProperty({
    description: 'Event creation timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Event last update timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  updated_at: Date;
}

export class EventWithLocationDto extends EventResponseDto {
  @ApiPropertyOptional({
    description: 'Location information',
    type: 'object',
    additionalProperties: false,
  })
  location?: {
    id: number;
    name: string;
    address1: string;
    city: string;
    state: string;
    country: string;
  };
}

export class EventWithCreatorDto extends EventResponseDto {
  @ApiPropertyOptional({
    description: 'Creator information',
    type: 'object',
    additionalProperties: false,
  })
  creator?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export class EventWithLocationAndCreatorDto extends EventResponseDto {
  @ApiPropertyOptional({
    description: 'Location information',
    type: 'object',
    additionalProperties: false,
  })
  location?: {
    id: number;
    name: string;
    address1: string;
    city: string;
    state: string;
    country: string;
  };

  @ApiPropertyOptional({
    description: 'Creator information',
    type: 'object',
    additionalProperties: false,
  })
  creator?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
}
