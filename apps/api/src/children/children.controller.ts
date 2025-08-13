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
  ApiQuery,
} from '@nestjs/swagger';
import { ChildrenService } from './children.service';
import { CreateChildrenDto } from './dto/create-children.dto';
import { UpdateChildrenDto } from './dto/update-children.dto';
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
    summary: 'Create a new children',
    description: 'Add a new children to the system for a parent/guardian',
  })
  @ApiBody({
    type: CreateChildrenDto,
    description: 'Children information',
  })
  @ApiResponse({
    status: 201,
    description: 'Children created successfully',
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
    description: 'Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Parent user not found',
  })
  @RequirePermission(['create_children'])
  create(@Body() body: CreateChildrenDto) {
    return this.childrenService.create(body);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all children',
    description: 'Retrieve a paginated list of all children in the system',
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
        data: {
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
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 25 },
            totalPages: { type: 'number', example: 3 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @RequirePermission(['read_children'])
  findAll(
    @Param('params', ParseIntPipe) params: { page: string; limit: string }
  ) {
    return this.childrenService.findAll(params);
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
