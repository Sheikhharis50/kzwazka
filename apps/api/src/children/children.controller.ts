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
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ChildrenService } from './children.service';
import { CreateChildrenDtoByAdmin } from './dto/create-children.dto';
import { UpdateChildrenDto } from './dto/update-children.dto';
import { QueryChildrenDto } from './dto/query-children.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PermissionGuard,
  RequirePermission,
} from 'src/auth/guards/permission.guard';

@ApiTags('Children')
@Controller('api/children')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth('JWT-auth')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new children with user account',
    description:
      'Create both a user account and children record in a single transaction',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('photo_url', {
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
        name: { type: 'string' },
        password: { type: 'string' },
        phone: { type: 'string' },
        role_id: { type: 'string' },
        is_active: { type: 'boolean' },
        google_social_id: { type: 'string' },
        dob: { type: 'string', format: 'date' },
        parent_name: { type: 'string' },
        location_id: { type: 'number' },
        group_id: { type: 'number' },
        photo_url: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User and children created successfully',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            email: { type: 'string', example: 'john.doe@example.com' },
            first_name: { type: 'string', example: 'John' },
            last_name: { type: 'string', example: 'Doe' },
            phone: { type: 'string', example: '+1-555-123-4567' },
            role_id: { type: 'string', example: 'children' },
            photo_url: {
              type: 'string',
              example: '/avatars/2025/08/123-abc123.jpg',
            },
            is_active: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        children: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            user_id: { type: 'number', example: 1 },
            dob: { type: 'string', format: 'date', example: '2015-06-15' },
            parent_first_name: { type: 'string', example: 'Jane' },
            parent_last_name: { type: 'string', example: 'Doe' },
            location_id: { type: 'number', example: 1 },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  @RequirePermission(['create_children'])
  create(
    @Body() body: CreateChildrenDtoByAdmin,
    @UploadedFile() photo_file?: Express.Multer.File
  ) {
    return this.childrenService.createdByAdmin(body, photo_file);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all children',
    description: 'Retrieve a paginated list of all children in the system',
  })
  @ApiQuery({
    name: 'search',
    description: 'Search children by name (parent first name or last name)',
    required: false,
    type: 'string',
    example: 'John',
  })
  @ApiQuery({
    name: 'location_id',
    description: 'Filter by location ID',
    required: false,
    type: 'number',
    example: 1,
  })
  @ApiQuery({
    name: 'sort_by',
    description: 'Sort by field',
    required: false,
    enum: ['created_at', 'dob'],
    example: 'created_at',
  })
  @ApiQuery({
    name: 'sort_order',
    description: 'Sort order',
    required: false,
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
    type: 'number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    required: false,
    type: 'number',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Children retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Children records' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              dob: { type: 'string', format: 'date', example: '2015-06-15' },
              parent_first_name: { type: 'string', example: 'Jane' },
              parent_last_name: { type: 'string', example: 'Doe' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  first_name: { type: 'string', example: 'John' },
                  last_name: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' },
                  photo_url: {
                    type: 'string',
                    example: 'https://example.com/photos/children.jpg',
                  },
                },
              },
              location: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Main Gym' },
                  address1: { type: 'string', example: '123 Main St' },
                  city: { type: 'string', example: 'New York' },
                  state: { type: 'string', example: 'NY' },
                },
              },
            },
          },
        },
        page: { type: 'number', example: 1 },
        limit: { type: 'number', example: 10 },
        count: { type: 'number', example: 25 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @RequirePermission(['read_children'])
  findAll(@Query() query: QueryChildrenDto) {
    return this.childrenService.findAll(query);
  }

  @Get('user/:userId')
  @RequirePermission(['read_children'])
  @ApiOperation({
    summary: 'Get children by user ID',
    description:
      'Retrieve all children associated with a specific parent/guardian',
  })
  @ApiParam({
    name: 'userId',
    description: 'Parent/guardian user ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Children retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          user_id: { type: 'number', example: 1 },
          dob: { type: 'string', format: 'date', example: '2015-06-15' },
          photo_url: {
            type: 'string',
            example: 'https://example.com/photos/children.jpg',
          },
          parent_first_name: { type: 'string', example: 'Jane' },
          parent_last_name: { type: 'string', example: 'Doe' },
          location_id: { type: 'number', example: 1 },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
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
  findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return this.childrenService.findByUserId(userId);
  }

  @Get(':id')
  @RequirePermission(['read_children'])
  @ApiOperation({
    summary: 'Get children by ID',
    description: 'Retrieve a specific children by their ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Children ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Children retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        user_id: { type: 'number', example: 1 },
        dob: { type: 'string', format: 'date', example: '2015-06-15' },
        photo_url: {
          type: 'string',
          example: 'https://example.com/photos/children.jpg',
        },
        parent_first_name: { type: 'string', example: 'Jane' },
        parent_last_name: { type: 'string', example: 'Doe' },
        location_id: { type: 'number', example: 1 },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid children ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Children not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.childrenService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission(['update_children'])
  @ApiOperation({
    summary: 'Update children',
    description: "Update an existing children's information",
  })
  @ApiParam({
    name: 'id',
    description: 'Children ID',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    type: UpdateChildrenDto,
    description: 'Updated children information',
  })
  @ApiResponse({
    status: 200,
    description: 'Children updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        user_id: { type: 'number', example: 1 },
        dob: { type: 'string', format: 'date', example: '2015-06-15' },
        photo_url: {
          type: 'string',
          example: 'https://example.com/photos/children.jpg',
        },
        parent_first_name: { type: 'string', example: 'Jane' },
        parent_last_name: { type: 'string', example: 'Doe' },
        location_id: { type: 'number', example: 1 },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid children ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Children not found',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateChildrenDto
  ) {
    return this.childrenService.update(id, body);
  }

  @Delete(':id')
  @RequirePermission(['delete_children'])
  @ApiOperation({
    summary: 'Delete children',
    description: 'Remove a children from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Children ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Children deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Children deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid children ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Children not found',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.childrenService.remove(id);
  }
}
