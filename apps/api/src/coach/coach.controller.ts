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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { createImageUploadInterceptor } from '../utils/file-interceptor.utils';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CoachService } from './coach.service';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import {
  PermissionGuard,
  RequirePermission,
} from '../auth/guards/permission.guard';
import { QueryCoachDto } from './dto/query-coach.dto';
import {
  CoachListResponseDto,
  CoachDetailResponseDto,
  CreateCoachResponseDto,
} from './dto/coach-response.dto';

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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(createImageUploadInterceptor('photo_url'))
  @ApiBody({
    type: CreateCoachDto,
    description: 'Coach creation data',
  })
  @ApiResponse({
    status: 201,
    description: 'Coach created successfully',
    type: CreateCoachResponseDto,
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
  create(
    @Body() createCoachDto: CreateCoachDto,
    @UploadedFile() photo_url?: Express.Multer.File
  ) {
    return this.coachService.create(createCoachDto, photo_url);
  }

  @Get()
  @RequirePermission(['read_coach'])
  @ApiOperation({
    summary: 'Get all coaches',
    description:
      'Retrieve a paginated list of all coaches with user, location, and groups information',
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
  @ApiResponse({
    status: 200,
    description: 'Coaches retrieved successfully',
    type: CoachListResponseDto,
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
      'Retrieve a specific coach by their ID with user, location, and groups information',
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
    type: CoachDetailResponseDto,
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(createImageUploadInterceptor('photo_url'))
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
    @Body() updateCoachDto: UpdateCoachDto,
    @UploadedFile() photo_url?: Express.Multer.File
  ) {
    return this.coachService.update(id, updateCoachDto, photo_url);
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
