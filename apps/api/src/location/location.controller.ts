import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  PermissionGuard,
  RequirePermission,
} from '../auth/guards/permission.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo_url'))
  @ApiBody({
    schema: {
      type: 'object',
      required: [
        'name',
        'address1',
        'city',
        'state',
        'country',
        'photo_url',
        'opening_time',
        'closing_time',
      ],
      properties: {
        name: { type: 'string', example: 'Location 1' },
        address1: { type: 'string', example: '123 Main St' },
        address2: { type: 'string', example: 'Apt 1' },
        city: { type: 'string', example: 'San Francisco' },
        state: { type: 'string', example: 'CA' },
        country: { type: 'string', example: 'USA' },
        photo_url: { type: 'string', format: 'binary' },
        opening_time: { type: 'string', format: 'time', example: '09:00' },
        closing_time: { type: 'string', format: 'time', example: '17:00' },
        description: { type: 'string', example: 'This is a description' },
        url: { type: 'string', example: 'https://example.com/location' },
      },
    },
  })
  @RequirePermission(['create_location'])
  @Post()
  create(
    @Body() createLocationDto: CreateLocationDto,
    @UploadedFile() photo_url: Express.Multer.File
  ) {
    return this.locationService.create(createLocationDto, photo_url);
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
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('photo_url'))
  @RequirePermission(['update_location'])
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateLocationDto: UpdateLocationDto,
    @UploadedFile() photo_url: Express.Multer.File
  ) {
    return this.locationService.update(id, updateLocationDto, photo_url);
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
