import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { MESSAGE_CONTENT_TYPE } from '../utils/constants';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PermissionGuard,
  RequirePermission,
} from '../auth/guards/permission.guard';
import { createGeneralFileUploadInterceptor } from '../utils/file-interceptor.utils';
import { APIRequest } from '../interfaces/request';

@ApiTags('messages')
@Controller('api/message')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @RequirePermission(['create_message'])
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(createGeneralFileUploadInterceptor('file', 10 * 1024 * 1024))
  @ApiOperation({
    summary: 'Create a new message',
    description:
      'Create a message for a specific group (if group_id provided) or send to all groups (if group_id not provided)',
  })
  @ApiResponse({ status: 201, description: 'Message(s) created successfully' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        content: { type: 'string', nullable: true },
        content_type: {
          type: 'string',
          enum: Object.values(MESSAGE_CONTENT_TYPE),
        },
        file: { type: 'string', format: 'binary', nullable: true },
        group_id: { type: 'number', nullable: true },
      },
    },
  })
  @ApiConsumes('multipart/form-data')
  create(
    @Body() createMessageDto: CreateMessageDto,
    @Request() req: APIRequest,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.messageService.create(createMessageDto, file, req.user.id);
  }

  @Get()
  @RequirePermission(['read_message'])
  @ApiOperation({ summary: 'Get all messages with optional filtering' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'group_id', type: Number, required: false })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('group_id') group_id?: string
  ) {
    return this.messageService.findAll({
      page,
      limit,
      group_id,
    });
  }

  @Get(':id')
  @RequirePermission(['read_message'])
  @ApiOperation({ summary: 'Get a specific message by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.messageService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission(['update_message'])
  @ApiOperation({ summary: 'Update a specific message' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMessageDto: UpdateMessageDto
  ) {
    return this.messageService.update(id, updateMessageDto);
  }

  @Delete(':id')
  @RequirePermission(['delete_message'])
  @ApiOperation({ summary: 'Delete a specific message' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.messageService.remove(id);
  }
}
