import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  PermissionGuard,
  RequirePermission,
} from '../auth/guards/permission.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('api/location')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({
    status: 201,
    description: 'The location has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @RequirePermission(['create_location'])
  @Post()
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.create(createLocationDto);
  }

  @ApiOperation({ summary: 'Get all locations' })
  @ApiResponse({
    status: 200,
    description: 'The locations have been successfully fetched.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @RequirePermission(['read_location'])
  @Get()
  findAll() {
    return this.locationService.findAll();
  }

  @ApiOperation({ summary: 'Get a location by id' })
  @ApiResponse({
    status: 200,
    description: 'The location has been successfully fetched.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @RequirePermission(['read_location'])
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.locationService.findOne(id);
  }

  @ApiOperation({ summary: 'Update a location by id' })
  @ApiResponse({
    status: 200,
    description: 'The location has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @RequirePermission(['update_location'])
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateLocationDto: UpdateLocationDto
  ) {
    return this.locationService.update(id, updateLocationDto);
  }

  @ApiOperation({ summary: 'Delete a location by id' })
  @ApiResponse({
    status: 200,
    description: 'The location has been successfully deleted.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @RequirePermission(['delete_location'])
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.locationService.remove(id);
  }
}
