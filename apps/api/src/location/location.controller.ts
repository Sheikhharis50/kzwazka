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
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('api/location')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}
  @ApiOperation({ summary: 'Create a new location' })
  @ApiResponse({
    status: 201,
    description: 'The location has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
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
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.locationService.remove(id);
  }
}
