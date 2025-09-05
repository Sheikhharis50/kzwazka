import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { createImageUploadInterceptor } from '../utils/file-interceptor.utils';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Admin')
@Controller('api/admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiTags('Admin')
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(createImageUploadInterceptor('photo'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        password: { type: 'string' },
        phone: { type: 'string' },
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Admin user created successfully',
  })
  async create(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() photo?: Express.Multer.File
  ) {
    return this.userService.createAdmin(createUserDto, photo);
  }
}
