import { ApiProperty } from '@nestjs/swagger';

export class ChildrenGroupResponseDto {
  @ApiProperty({
    description: 'Children-group relationship ID',
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
    description: 'Status of the relationship',
    example: true,
  })
  status: boolean;

  @ApiProperty({
    description: 'Relationship creation timestamp',
    example: '2024-01-15T09:00:00.000Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'Relationship last update timestamp',
    example: '2024-01-15T09:00:00.000Z',
  })
  updated_at: Date;
}

export class ChildrenGroupWithChildrenDto extends ChildrenGroupResponseDto {
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

export class ChildrenGroupWithGroupDto extends ChildrenGroupResponseDto {
  @ApiProperty({
    description: 'Group information',
    type: 'object',
    properties: {
      id: { type: 'number', example: 1 },
      name: { type: 'string', example: 'Beginner Group' },
      skill_level: { type: 'string', example: 'beginner' },
      min_age: { type: 'number', example: 8 },
      max_age: { type: 'number', example: 12 },
    },
  })
  group: {
    id: number;
    name: string;
    skill_level: string;
    min_age: number;
    max_age: number;
  };
}

export class ChildrenGroupWithChildrenAndGroupDto extends ChildrenGroupResponseDto {
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
      min_age: { type: 'number', example: 8 },
      max_age: { type: 'number', example: 12 },
    },
  })
  group: {
    id: number;
    name: string;
    skill_level: string;
    min_age: number;
    max_age: number;
  };
}

export class PaginatedChildrenGroupResponseDto {
  @ApiProperty({
    description: 'Response message',
    example: 'Successfully fetched children-group relationships',
  })
  message: string;

  @ApiProperty({
    description: 'Array of children-group relationships',
    type: [ChildrenGroupWithChildrenAndGroupDto],
  })
  data: ChildrenGroupWithChildrenAndGroupDto[];

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
