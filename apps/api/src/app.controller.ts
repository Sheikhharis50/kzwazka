import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { APIResponse } from './utils/response';

@ApiTags('Health Check')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if the API is running and healthy',
  })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    schema: {
      type: 'string',
      example: 'OK',
    },
  })
  health(): APIResponse<undefined> {
    return this.appService.health();
  }
}
