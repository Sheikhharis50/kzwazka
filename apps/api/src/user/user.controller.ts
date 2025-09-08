import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { createImageUploadInterceptor } from '../utils/file-interceptor.utils';
import { UserService } from './user.service';
import { CreateAdminDto } from './dto/create-admin.dto';

@ApiTags('Admin')
@Controller('api/admin')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiTags('Admin')
  @ApiOperation({ summary: 'Create a new admin user' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(createImageUploadInterceptor('photo_url'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' },
        first_name: { type: 'string' },
        last_name: { type: 'string' },
        password: { type: 'string' },
        phone: { type: 'string' },
        photo_url: { type: 'string', format: 'binary' },
        admin_secret: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Admin user created successfully',
  })
  async create(
    @Body() createAdminDto: CreateAdminDto,
    @UploadedFile() photo_url?: Express.Multer.File
  ) {
    return this.userService.createAdmin(createAdminDto, photo_url);
  }
}
