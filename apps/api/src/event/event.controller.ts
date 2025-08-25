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
  Req,
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
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { APIRequest } from '../interfaces/request';

@ApiTags('Events')
@Controller('api/event')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new event',
    description: 'Create a new event in the system',
  })
  @ApiBody({
    type: CreateEventDto,
    description: 'Event information',
  })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  create(@Body() createEventDto: CreateEventDto, @Req() req: APIRequest) {
    return this.eventService.create(createEventDto, req.user.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all events',
    description:
      'Retrieve a paginated list of all events with optional filters',
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
    description: 'Search term for event title',
    required: false,
    type: 'string',
  })
  @ApiQuery({
    name: 'status',
    description: 'Event status filter',
    required: false,
    enum: ['active', 'inactive', 'cancelled', 'completed', 'draft'],
  })
  @ApiQuery({
    name: 'location_id',
    description: 'Filter by location ID',
    required: false,
    type: 'number',
  })
  @ApiQuery({
    name: 'min_age',
    description: 'Minimum age filter',
    required: false,
    type: 'number',
  })
  @ApiQuery({
    name: 'max_age',
    description: 'Maximum age filter',
    required: false,
    type: 'number',
  })
  @ApiQuery({
    name: 'from_date',
    description: 'Filter events from this date',
    required: false,
    type: 'string',
    format: 'date',
  })
  @ApiQuery({
    name: 'to_date',
    description: 'Filter events until this date',
    required: false,
    type: 'string',
    format: 'date',
  })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  findAll(@Query() query: QueryEventDto) {
    return this.eventService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get event by ID',
    description: 'Retrieve a specific event by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Event ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Event retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  findOne(@Param('id') id: string) {
    return this.eventService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update event',
    description: 'Update an existing event (only by the creator)',
  })
  @ApiParam({
    name: 'id',
    description: 'Event ID',
    type: 'number',
    example: 1,
  })
  @ApiBody({
    type: UpdateEventDto,
    description: 'Event update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or permission denied',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() req: APIRequest
  ) {
    return this.eventService.update(+id, updateEventDto, req.user.id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete event',
    description: 'Delete an existing event (only by the creator)',
  })
  @ApiParam({
    name: 'id',
    description: 'Event ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Event deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or permission denied',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  remove(@Param('id') id: string, @Req() req: APIRequest) {
    return this.eventService.remove(+id, req.user.id);
  }
}
