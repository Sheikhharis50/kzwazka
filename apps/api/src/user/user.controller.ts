import {
  Controller,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Patch,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
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
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1,
      },
      fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    })
  )
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

  @Patch(':id/photo')
  @ApiOperation({ summary: 'Update user profile photo' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1,
      },
      fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      },
    })
  )
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Profile photo updated successfully',
  })
  async updatePhoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() photo: Express.Multer.File
  ) {
    return this.userService.updatePhoto(id, photo);
  }
}
