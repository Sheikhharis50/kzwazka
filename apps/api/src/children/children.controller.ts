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
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Children')
@Controller('api/children')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ChildrenController {
  constructor(private readonly childrenService: ChildrenService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new child',
    description: 'Add a new child to the system for a parent/guardian',
  })
  @ApiBody({
    type: CreateChildDto,
    description: 'Child information',
  })
  @ApiResponse({
    status: 201,
    description: 'Child created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        user_id: { type: 'number', example: 1 },
        dob: { type: 'string', format: 'date', example: '2015-06-15' },
        photo_url: {
          type: 'string',
          example: 'https://example.com/photos/child.jpg',
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
  create(@Body() body: CreateChildDto) {
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
                example: 'https://example.com/photos/child.jpg',
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
  findAll(
    @Param('params', ParseIntPipe) params: { page: string; limit: string }
  ) {
    return this.childrenService.findAll(params);
  }

  @Get('user/:userId')
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
            example: 'https://example.com/photos/child.jpg',
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
  @ApiOperation({
    summary: 'Get child by ID',
    description: 'Retrieve a specific child by their ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Child ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Child retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        user_id: { type: 'number', example: 1 },
        dob: { type: 'string', format: 'date', example: '2015-06-15' },
        photo_url: {
          type: 'string',
          example: 'https://example.com/photos/child.jpg',
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
    description: 'Invalid child ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Child not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.childrenService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update child',
    description: "Update an existing child's information",
  })
  @ApiParam({
    name: 'id',
    description: 'Child ID',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    type: UpdateChildDto,
    description: 'Updated child information',
  })
  @ApiResponse({
    status: 200,
    description: 'Child updated successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        user_id: { type: 'number', example: 1 },
        dob: { type: 'string', format: 'date', example: '2015-06-15' },
        photo_url: {
          type: 'string',
          example: 'https://example.com/photos/child.jpg',
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
    description: 'Validation error or invalid child ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Child not found',
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateChildDto) {
    return this.childrenService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete child',
    description: 'Remove a child from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Child ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Child deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Child deleted successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid child ID',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Child not found',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.childrenService.remove(id);
  }
}
