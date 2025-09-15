import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { QueryAttendanceDto } from './dto/query-attendance.dto';
import {
  AttendanceResponseDto,
  AttendanceWithChildrenAndGroupDto,
  PaginatedAttendanceResponseDto,
} from './dto/attendance-response.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  PermissionGuard,
  RequirePermission,
} from 'src/auth/guards/permission.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Attendance')
@Controller('api/attendance')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @ApiOperation({ summary: 'Create a new attendance record' })
  @ApiResponse({
    status: 201,
    description: 'The attendance record has been successfully created.',
    type: AttendanceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBearerAuth()
  @RequirePermission(['create_attendance'])
  @Post()
  create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return this.attendanceService.create(createAttendanceDto);
  }

  @ApiOperation({
    summary: 'Get all attendance records with filtering and pagination',
  })
  @ApiResponse({
    status: 200,
    description: 'The attendance records have been successfully fetched.',
    type: PaginatedAttendanceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiBearerAuth()
  @RequirePermission(['read_attendance'])
  @Get()
  @ApiQuery({ name: 'children_id', required: false, type: Number })
  @ApiQuery({ name: 'group_id', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['present', 'absent', 'late'],
  })
  @ApiQuery({ name: 'date', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number, default: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, default: 10 })
  findAll(@Query() queryDto: QueryAttendanceDto) {
    return this.attendanceService.findAllChildrenwithAttendance(queryDto);
  }

  @ApiOperation({ summary: 'Get a specific attendance record by ID' })
  @ApiResponse({
    status: 200,
    description: 'The attendance record has been successfully fetched.',
    type: AttendanceWithChildrenAndGroupDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  @ApiBearerAuth()
  @RequirePermission(['read_attendance'])
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendanceService.findOne(+id);
  }

  @ApiOperation({ summary: 'Update an attendance record by ID' })
  @ApiResponse({
    status: 200,
    description: 'The attendance record has been successfully updated.',
    type: AttendanceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  @ApiBearerAuth()
  @RequirePermission(['update_attendance'])
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto
  ) {
    return this.attendanceService.update(+id, updateAttendanceDto);
  }

  @ApiOperation({ summary: 'Delete an attendance record by ID' })
  @ApiResponse({
    status: 200,
    description: 'The attendance record has been successfully deleted.',
    type: AttendanceResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 404, description: 'Attendance record not found' })
  @ApiBearerAuth()
  @RequirePermission(['delete_attendance'])
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendanceService.remove(+id);
  }
}
