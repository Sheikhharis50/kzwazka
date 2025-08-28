import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoachService } from './coach.service';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import {
  PermissionGuard,
  RequirePermission,
} from '../auth/guards/permission.guard';
import { QueryCoachDto } from './dto/query-coach.dto';

@ApiTags('Coaches')
@Controller('api/coach')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth('JWT-auth')
export class CoachController {
  constructor(private readonly coachService: CoachService) {}

  @Post()
  @RequirePermission(['create_coach'])
  @ApiOperation({
    summary: 'Create a new coach',
    description: 'Create a new coach account with associated user record',
  })
  @ApiBody({
    type: CreateCoachDto,
    description: 'Coach information',
  })
  @ApiResponse({
    status: 201,
    description: 'Coach created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Coach created successfully' },
        data: {
          type: 'object',
          properties: {
            coach: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john.doe@example.com' },
                phone: { type: 'string', example: '+1234567890' },
                status: { type: 'boolean', example: true },
                location_id: { type: 'number', example: 1 },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time' },
              },
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                email: { type: 'string', example: 'john.doe@example.com' },
                first_name: { type: 'string', example: 'John' },
                last_name: { type: 'string', example: 'Doe' },
                role: { type: 'string', example: 'coach' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or coach already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Coach with this email already exists',
  })
  create(@Body() createCoachDto: CreateCoachDto) {
    return this.coachService.create(createCoachDto);
  }

  @Get()
  @RequirePermission(['read_coach'])
  @ApiOperation({
    summary: 'Get all coaches',
    description:
      'Retrieve a paginated list of all coaches with user and location information',
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
  @ApiQuery({
    name: 'search',
    description: 'Search query',
    required: false,
    type: 'string',
    example: 'John',
  })
  @ApiQuery({
    name: 'location_id',
    description: 'Location ID',
    required: false,
    type: 'number',
    example: 1,
  })
  @ApiQuery({
    name: 'sort_by',
    description: 'Sort by field',
    required: false,
    type: 'string',
    example: 'created_at',
  })
  @ApiQuery({
    name: 'sort_order',
    description: 'Sort order',
    required: false,
    type: 'string',
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
  @ApiQuery({
    name: 'search',
    description: 'Search query',
    required: false,
    type: 'string',
    example: 'John',
  })
  @ApiQuery({
    name: 'location_id',
    description: 'Location ID',
    required: false,
    type: 'number',
    example: 1,
  })
  @ApiQuery({
    name: 'sort_by',
    description: 'Sort by field',
    required: false,
    type: 'string',
    example: 'created_at',
  })
  @ApiQuery({
    name: 'sort_order',
    description: 'Sort order',
    required: false,
    type: 'string',
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
    description: 'Coaches retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Coaches retrieved successfully' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john.doe@example.com' },
              phone: { type: 'string', example: '+1234567890' },
              status: { type: 'boolean', example: true },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  first_name: { type: 'string', example: 'John' },
                  last_name: { type: 'string', example: 'Doe' },
                  email: { type: 'string', example: 'john.doe@example.com' },
                  is_active: { type: 'boolean', example: true },
                  is_verified: { type: 'boolean', example: true },
                },
              },
              location: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'Downtown Gym' },
                  address1: { type: 'string', example: '123 Main St' },
                  city: { type: 'string', example: 'New York' },
                  state: { type: 'string', example: 'NY' },
                },
              },
            },
          },
        },
        page: { type: 'string', example: '1' },
        limit: { type: 'string', example: '10' },
        count: { type: 'number', example: 25 },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  findAll(@Query() query: QueryCoachDto) {
    return this.coachService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(['read_coach'])
  @ApiOperation({
    summary: 'Get coach by ID',
    description:
      'Retrieve a specific coach by their ID with user and location information',
  })
  @ApiParam({
    name: 'id',
    description: 'Coach ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Coach retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Coach retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john.doe@example.com' },
            phone: { type: 'string', example: '+1234567890' },
            status: { type: 'boolean', example: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                first_name: { type: 'string', example: 'John' },
                last_name: { type: 'string', example: 'Doe' },
                email: { type: 'string', example: 'john.doe@example.com' },
                is_active: { type: 'boolean', example: true },
                is_verified: { type: 'boolean', example: true },
              },
            },
            location: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'Downtown Gym' },
                address1: { type: 'string', example: '123 Main St' },
                city: { type: 'string', example: 'New York' },
                state: { type: 'string', example: 'NY' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Coach not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coachService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission(['update_coach'])
  @ApiOperation({
    summary: 'Update coach',
    description: 'Update coach information and optionally associated user data',
  })
  @ApiParam({
    name: 'id',
    description: 'Coach ID',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    type: UpdateCoachDto,
    description: 'Coach update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Coach updated successfully',
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
    description: 'Coach not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Coach with this email already exists',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCoachDto: UpdateCoachDto
  ) {
    return this.coachService.update(id, updateCoachDto);
  }

  @Patch(':id/status')
  @RequirePermission(['update_coach'])
  @ApiOperation({
    summary: 'Update coach status',
    description: 'Update the active/inactive status of a coach',
  })
  @ApiParam({
    name: 'id',
    description: 'Coach ID',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'boolean',
          description: 'Coach status (true for active, false for inactive)',
          example: true,
        },
      },
      required: ['status'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Coach status updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Coach not found',
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: boolean
  ) {
    return this.coachService.updateStatus(id, status);
  }

  @Delete(':id')
  @RequirePermission(['delete_coach'])
  @ApiOperation({
    summary: 'Delete coach',
    description: 'Remove a coach from the system (user record is preserved)',
  })
  @ApiParam({
    name: 'id',
    description: 'Coach ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Coach deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Coach not found',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.coachService.remove(id);
  }
}
