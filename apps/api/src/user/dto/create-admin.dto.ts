import { IsNotEmpty, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminDto extends CreateUserDto {
  @ApiProperty({
    description: 'Admin secret',
    example: 'admin',
    maxLength: 50,
  })
  @IsString({ message: 'Admin secret must be a string' })
  @IsNotEmpty({ message: 'Admin secret is required' })
  admin_secret: string;
}
