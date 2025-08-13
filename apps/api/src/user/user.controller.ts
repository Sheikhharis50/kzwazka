import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PermissionGuard,
  RequirePermission,
} from 'src/auth/guards/permission.guard';

@ApiTags('Users')
@Controller('api/user')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @RequirePermission(['create_user'])
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Create a new user account in the system',
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User information',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'john.doe@example.com' },
        first_name: { type: 'string', example: 'John' },
        last_name: { type: 'string', example: 'Doe' },
        phone: { type: 'string', example: '+1-555-123-4567' },
        role_id: { type: 'string', example: 'user' },
        is_active: { type: 'boolean', example: true },
        is_verified: { type: 'boolean', example: false },
        google_social_id: { type: 'string', example: 'google_123456789' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or user already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  create(@Body() body: CreateUserDto) {
    return this.userService.create(body);
  }

  @Get()
  @RequirePermission(['read_user'])
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a list of all users in the system',
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          email: { type: 'string', example: 'john.doe@example.com' },
          first_name: { type: 'string', example: 'John' },
          last_name: { type: 'string', example: 'Doe' },
          phone: { type: 'string', example: '+1-555-123-4567' },
          role_id: { type: 'string', example: 'user' },
          is_active: { type: 'boolean', example: true },
          is_verified: { type: 'boolean', example: true },
          google_social_id: { type: 'string', example: 'google_123456789' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @RequirePermission(['read_user'])
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their ID',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'User retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'john.doe@example.com' },
        first_name: { type: 'string', example: 'John' },
        last_name: { type: 'string', example: 'Doe' },
        phone: { type: 'string', example: '+1-555-123-4567' },
        role_id: { type: 'string', example: 'user' },
        is_active: { type: 'boolean', example: true },
        is_verified: { type: 'boolean', example: true },
        google_social_id: { type: 'string', example: 'google_123456789' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission(['update_user'])
  @ApiOperation({
    summary: 'Update user',
    description: "Update an existing user's information",
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'Updated user information',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        email: { type: 'string', example: 'john.doe@example.com' },
        first_name: { type: 'string', example: 'John' },
        last_name: { type: 'string', example: 'Doe' },
        phone: { type: 'string', example: '+1-555-123-4567' },
        role_id: { type: 'string', example: 'user' },
        is_active: { type: 'boolean', example: true },
        is_verified: { type: 'boolean', example: true },
        google_social_id: { type: 'string', example: 'google_123456789' },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid user ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateUserDto) {
    return this.userService.update(id, body);
  }

  @Delete(':id')
  @RequirePermission(['delete_user'])
  @ApiOperation({
    summary: 'Delete user',
    description: 'Remove a user from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'User deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}
