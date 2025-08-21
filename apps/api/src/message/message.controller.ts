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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  PermissionGuard,
  RequirePermission,
} from '../auth/guards/permission.guard';

@ApiTags('messages')
@Controller('api/message')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @RequirePermission(['create_message'])
  @ApiOperation({
    summary: 'Create a new message',
    description:
      'Create a message for a specific group (if group_id provided) or send to all groups (if group_id not provided)',
  })
  @ApiResponse({ status: 201, description: 'Message(s) created successfully' })
  create(@Body() createMessageDto: CreateMessageDto) {
    return this.messageService.create(createMessageDto);
  }

  @Get()
  @RequirePermission(['read_message'])
  @ApiOperation({ summary: 'Get all messages with optional filtering' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('group_id') groupId?: string
  ) {
    return this.messageService.findAll({
      page,
      limit,
      group_id: groupId ? parseInt(groupId, 10) : undefined,
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
