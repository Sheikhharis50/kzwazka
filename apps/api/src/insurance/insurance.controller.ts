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
import { InsuranceService } from './insurance.service';
import { CreateInsuranceDto } from './dto/create-insurance.dto';
import { UpdateInsuranceDto } from './dto/update-insurance.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { INSURANCE_COVERAGE_TYPE } from '../utils/constants';

@UseGuards(JwtAuthGuard)
@Controller('insurance')
@ApiTags('Insurance')
@ApiBearerAuth('JWT-auth')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new insurance' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        children_id: { type: 'number' },
        name: { type: 'string' },
        policy_id: { type: 'string' },
        start_date: { type: 'string', format: 'date' },
        end_date: { type: 'string', format: 'date' },
        coverage_type: {
          type: 'string',
          enum: Object.values(INSURANCE_COVERAGE_TYPE),
        },
        content: { type: 'string', format: 'binary' },
        coverage_amount: { type: 'number' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('content'))
  @ApiResponse({
    status: 201,
    description: 'The insurance has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  create(
    @Body() createInsuranceDto: CreateInsuranceDto,
    @UploadedFile() content: Express.Multer.File
  ) {
    return this.insuranceService.create(createInsuranceDto, content);
  }

  @Get()
  @ApiOperation({ summary: 'Get all insurance' })
  @ApiResponse({
    status: 200,
    description: 'The insurance has been successfully fetched.',
  })
  findAll() {
    return this.insuranceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an insurance by id' })
  @ApiResponse({
    status: 200,
    description: 'The insurance has been successfully fetched.',
  })
  findOne(@Param('id') id: string) {
    return this.insuranceService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an insurance by id' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        children_id: { type: 'number' },
        name: { type: 'string' },
        policy_id: { type: 'string' },
        start_date: { type: 'string', format: 'date' },
        end_date: { type: 'string', format: 'date' },
        coverage_type: {
          type: 'string',
          enum: Object.values(INSURANCE_COVERAGE_TYPE),
        },
        content: { type: 'string', format: 'binary' },
        coverage_amount: { type: 'number' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('content'))
  @ApiResponse({
    status: 200,
    description: 'The insurance has been successfully updated.',
  })
  update(
    @Param('id') id: string,
    @Body() updateInsuranceDto: UpdateInsuranceDto,
    @UploadedFile() content: Express.Multer.File
  ) {
    return this.insuranceService.update(+id, updateInsuranceDto, content);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an insurance by id' })
  @ApiResponse({
    status: 200,
    description: 'The insurance has been successfully deleted.',
  })
  remove(@Param('id') id: string) {
    return this.insuranceService.remove(+id);
  }
}
