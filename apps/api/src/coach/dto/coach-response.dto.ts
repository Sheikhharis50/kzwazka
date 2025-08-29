import { ApiProperty } from '@nestjs/swagger';

export class GroupResponseDto {
  @ApiProperty({ description: 'Group ID' })
  id: number;

  @ApiProperty({ description: 'Group name' })
  name: string;

  @ApiProperty({ description: 'Group description', required: false })
  description: string | null;

  @ApiProperty({ description: 'Minimum age for the group' })
  min_age: number;

  @ApiProperty({ description: 'Maximum age for the group' })
  max_age: number;

  @ApiProperty({ description: 'Skill level required for the group' })
  skill_level: string;

  @ApiProperty({ description: 'Maximum number of children in the group' })
  max_group_size: number;

  @ApiProperty({ description: 'Group creation date' })
  created_at: Date;

  @ApiProperty({ description: 'Group last update date' })
  updated_at: Date;
}

export class UserResponseDto {
  @ApiProperty({ description: 'User ID' })
  id: number;

  @ApiProperty({ description: 'User first name' })
  first_name: string;

  @ApiProperty({ description: 'User last name' })
  last_name: string;

  @ApiProperty({ description: 'User email' })
  email: string;

  @ApiProperty({ description: 'Whether the user is active' })
  is_active: boolean;

  @ApiProperty({ description: 'Whether the user is verified' })
  is_verified: boolean;

  @ApiProperty({ description: 'User profile photo URL', required: false })
  photo_url: string | null;
}

export class LocationResponseDto {
  @ApiProperty({ description: 'Location ID' })
  id: number;

  @ApiProperty({ description: 'Location name' })
  name: string;

  @ApiProperty({ description: 'Location address line 1' })
  address1: string;

  @ApiProperty({ description: 'Location city' })
  city: string;

  @ApiProperty({ description: 'Location state' })
  state: string;
}

export class CoachResponseDto {
  @ApiProperty({ description: 'Coach ID' })
  id: number;

  @ApiProperty({ description: 'Coach creation date' })
  created_at: Date;

  @ApiProperty({ description: 'Coach last update date' })
  updated_at: Date;

  @ApiProperty({ description: 'User information', type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Location information',
    type: LocationResponseDto,
    required: false,
  })
  location: LocationResponseDto | null;

  @ApiProperty({
    description: 'Group assigned to this coach',
    type: GroupResponseDto,
  })
  group: GroupResponseDto | null;
}

export class CoachListResponseDto {
  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'List of coaches', type: [CoachResponseDto] })
  data: CoachResponseDto[];

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Number of items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of coaches' })
  count: number;
}

export class CoachDetailResponseDto {
  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Coach details', type: CoachResponseDto })
  data: CoachResponseDto;
}

export class CreateCoachResponseDto {
  @ApiProperty({ description: 'Response message' })
  message: string;

  @ApiProperty({ description: 'Created coach data' })
  data: {
    coach: {
      id: number;
      location_id: number | null;
      created_at: Date;
      updated_at: Date;
    };
    user: {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      phone: string;
      role: string;
      photo_url: string | null;
    };
  };
}
