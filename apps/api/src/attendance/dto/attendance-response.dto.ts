import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AttendanceResponseDto {
  @ApiProperty({
    description: 'Attendance record ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Children ID',
    example: 1,
  })
  children_id: number;

  @ApiProperty({
    description: 'Group ID',
    example: 1,
  })
  group_id: number;

  @ApiProperty({
    description: 'Attendance date',
    example: '2024-01-15T09:00:00.000Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Attendance status',
    example: 'present',
    enum: ['present', 'absent', 'late'],
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Additional notes about attendance',
    example: 'Arrived 5 minutes late due to traffic',
  })
  notes?: string;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2024-01-15T09:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2024-01-15T09:00:00.000Z',
  })
  updated_at: Date;
}

export class AttendanceWithChildrenDto extends AttendanceResponseDto {
  @ApiProperty({
    description: 'Children information',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      parent_first_name: { type: 'string', example: 'John' },
      parent_last_name: { type: 'string', example: 'Doe' },
    },
  })
  children: {
    id: number;
    parent_first_name: string;
    parent_last_name: string;
  };
}

export class AttendanceWithGroupDto extends AttendanceResponseDto {
  @ApiProperty({
    description: 'Group information',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'Beginner Group' },
      skill_level: { type: 'string', example: 'beginner' },
    },
  })
  group: {
    id: number;
    name: string;
    skill_level: string;
  };
}

export class AttendanceWithChildrenAndGroupDto extends AttendanceResponseDto {
  @ApiProperty({
    description: 'Children information',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      parent_first_name: { type: 'string', example: 'John' },
      parent_last_name: { type: 'string', example: 'Doe' },
    },
  })
  children: {
    id: number;
    parent_first_name: string;
    parent_last_name: string;
  };

  @ApiProperty({
    description: 'Group information',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'Beginner Group' },
      skill_level: { type: 'string', example: 'beginner' },
    },
  })
  group: {
    id: number;
    name: string;
    skill_level: string;
  };
}

export class PaginatedAttendanceResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Successfully fetched attendance records',
  })
  message: string;

  @ApiProperty({
    description: 'Array of attendance records',
    type: [AttendanceWithChildrenAndGroupDto],
  })
  data: AttendanceWithChildrenAndGroupDto[];

  @ApiProperty({
    description: 'Pagination information',
    type: 'object',
    properties: {
      page: { type: 'number', example: 1 },
      limit: { type: 'number', example: 10 },
      total: { type: 'number', example: 50 },
      totalPages: { type: 'number', example: 5 },
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
