import { Injectable, Logger } from '@nestjs/common';
import { APIResponse } from './utils/response';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  health(): APIResponse<undefined> {
    return APIResponse.success<undefined>({
      message: 'API server is running',
      statusCode: 200,
    });
  }
}
