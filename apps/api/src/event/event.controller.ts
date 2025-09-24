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
import {
  PermissionGuard,
  RequirePermission,
} from '../auth/guards/permission.guard';
import { APIResponse } from 'src/utils/response';
import { Event } from '../db/schemas/eventSchema';
import { EventWithFullDetails } from './event.types';

@ApiTags('Events')
@Controller('api/event')
@UseGuards(JwtAuthGuard, PermissionGuard)
@ApiBearerAuth('JWT-auth')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @RequirePermission(['create_event'])
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
  create(
    @Body() createEventDto: CreateEventDto
  ): Promise<APIResponse<Event | undefined>> {
    return this.eventService.create(createEventDto);
  }

  @Get()
  @RequirePermission(['read_event'])
  @ApiOperation({
    summary: 'Get all events',
    description:
      'Retrieve a paginated list of all events with optional filters',
  })
  @ApiQuery({
    name: 'search',
    description: 'Search term for event title',
    required: false,
    type: 'string',
  })
  @ApiQuery({
    name: 'location_id',
    description: 'Filter by location ID',
    required: false,
    type: 'number',
  })
  @ApiQuery({
    name: 'date',
    description: 'Filter events by date',
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
  findAll(
    @Query() query: QueryEventDto
  ): Promise<APIResponse<EventWithFullDetails[] | undefined>> {
    return this.eventService.findAll(query);
  }

  @Get(':id')
  @RequirePermission(['read_event'])
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
  @RequirePermission(['update_event'])
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
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventService.update(+id, updateEventDto);
  }

  @Delete(':id')
  // @RequirePermission(['delete_event'])
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
  remove(@Param('id') id: string) {
    return this.eventService.remove(+id);
  }
}
