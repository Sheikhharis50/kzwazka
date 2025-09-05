import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { GROUP_SESSION_DAY } from 'src/utils/constants';

export class CreateGroupSessionDto {
  @ApiProperty({
    description: 'The id of the group',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  group_id: number;

  @ApiProperty({
    description: 'The day of the group session',
    example: GROUP_SESSION_DAY.MONDAY,
  })
  @IsEnum(GROUP_SESSION_DAY)
  @IsNotEmpty()
  day: GROUP_SESSION_DAY;

  @ApiProperty({
    description: 'The start time of the group session',
    example: '10:00',
  })
  @IsString()
  @IsNotEmpty()
  start_time: string;

  @ApiProperty({
    description: 'The end time of the group session',
    example: '11:00',
  })
  @IsString()
  @IsNotEmpty()
  end_time: string;
}
