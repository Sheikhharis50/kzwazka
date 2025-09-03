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
  UploadedFile,
  UseInterceptors,
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
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import {
  PermissionGuard,
  RequirePermission,
} from '../auth/guards/permission.guard';
import { FileInterceptor } from '@nestjs/platform-express';
@ApiTags('Groups')
@Controller('api/group')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth('JWT-auth')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @RequirePermission(['create_group'])
  @UseInterceptors(FileInterceptor('photo_url'))
  @ApiOperation({
    summary: 'Create a new group',
    description:
      'Create a new training group with age requirements and skill level',
  })
  @ApiBody({
    type: CreateGroupDto,
    description: 'Group information',
  })
  @ApiResponse({
    status: 201,
    description: 'Group created successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Group created successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Advanced Wrestling Group' },
            description: { type: 'string', example: 'Advanced level training' },
            min_age: { type: 'number', example: 12 },
            max_age: { type: 'number', example: 18 },
            skill_level: { type: 'string', example: 'intermediate' },
            max_group_size: { type: 'number', example: 15 },
            location_id: { type: 'number', example: 1 },
            coach_id: { type: 'number', example: 1 },
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
    description:
      'Conflict - Group with this name already exists at this location',
  })
  create(
    @Body() createGroupDto: CreateGroupDto,
    @UploadedFile() photo_url?: Express.Multer.File
  ) {
    return this.groupService.create(createGroupDto, photo_url);
  }

  @Get()
  @RequirePermission(['read_group'])
  @ApiOperation({
    summary: 'Get all groups',
    description:
      'Retrieve a paginated list of all groups with location and coach information',
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
    description: 'Groups retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Groups retrieved successfully' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              name: { type: 'string', example: 'Advanced Wrestling Group' },
              description: {
                type: 'string',
                example: 'Advanced level training',
              },
              min_age: { type: 'number', example: 12 },
              max_age: { type: 'number', example: 18 },
              skill_level: { type: 'string', example: 'intermediate' },
              max_group_size: { type: 'number', example: 15 },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
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
              coach: {
                type: 'object',
                properties: {
                  id: { type: 'number', example: 1 },
                  name: { type: 'string', example: 'John Doe' },
                  email: { type: 'string', example: 'john@example.com' },
                  phone: { type: 'string', example: '+1234567890' },
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
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    return this.groupService.findAll({ page, limit });
  }

  @Get(':id')
  @RequirePermission(['read_group'])
  @ApiOperation({
    summary: 'Get group by ID',
    description:
      'Retrieve a specific group by their ID with location and coach information',
  })
  @ApiParam({
    name: 'id',
    description: 'Group ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Group retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Group retrieved successfully' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'number', example: 1 },
            name: { type: 'string', example: 'Advanced Wrestling Group' },
            description: { type: 'string', example: 'Advanced level training' },
            min_age: { type: 'number', example: 12 },
            max_age: { type: 'number', example: 18 },
            skill_level: { type: 'string', example: 'intermediate' },
            max_group_size: { type: 'number', example: 15 },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
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
            coach: {
              type: 'object',
              properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john@example.com' },
                phone: { type: 'string', example: '+1234567890' },
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
    description: 'Group not found',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission(['update_group'])
  @UseInterceptors(FileInterceptor('photo_url'))
  @ApiOperation({
    summary: 'Update group',
    description: 'Update group information',
  })
  @ApiParam({
    name: 'id',
    description: 'Group ID',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    type: UpdateGroupDto,
    description: 'Group update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Group updated successfully',
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
    description: 'Group not found',
  })
  @ApiResponse({
    status: 409,
    description:
      'Conflict - Group with this name already exists at this location',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateGroupDto: UpdateGroupDto,
    @UploadedFile() photo_url?: Express.Multer.File
  ) {
    return this.groupService.update(id, updateGroupDto, photo_url);
  }

  @Delete(':id')
  @RequirePermission(['delete_group'])
  @ApiOperation({
    summary: 'Delete group',
    description: 'Remove a group from the system',
  })
  @ApiParam({
    name: 'id',
    description: 'Group ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Group deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Group not found',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.groupService.remove(id);
  }
}
