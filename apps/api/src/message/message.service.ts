import { Injectable, Logger } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { DatabaseService } from '../db/drizzle.service';
import { eq, desc, sql, and, type SQL } from 'drizzle-orm';
import {
  messageSchema,
  groupSchema,
  locationSchema,
  coachSchema,
  userSchema,
} from '../db/schemas';
import { getPageOffset } from '../utils/pagination';
import { APP_CONSTANTS, MESSAGE_CONTENT_TYPE } from '../utils/constants';
import { FileStorageService } from '../services';
import { APIResponse } from '../utils/response';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly fileStorageService: FileStorageService
  ) {}

  async create(createMessageDto: CreateMessageDto, file?: Express.Multer.File) {
    try {
      const validationResponse = this.validateMessageContent(
        createMessageDto,
        file
      );
      if (!validationResponse.data) {
        return validationResponse;
      }

      if (createMessageDto.group_id) {
        const content = createMessageDto.content || '';

        const messageData = {
          content,
          content_type: createMessageDto.content_type,
          group_id: createMessageDto.group_id,
        };

        const createdMessage = await this.dbService.db
          .insert(messageSchema)
          .values(messageData)
          .returning();

        if (
          file &&
          createMessageDto.content_type !== MESSAGE_CONTENT_TYPE.TEXT
        ) {
          await this.uploadMessageFile(file, createdMessage[0].id);
        }

        return APIResponse.success({
          message: 'Message created successfully',
          statusCode: 201,
          data: createdMessage,
        });
      }

      const groups = await this.dbService.db.select().from(groupSchema);

      if (groups.length === 0) {
        return APIResponse.error({
          message: 'No groups found',
          statusCode: 404,
        });
      }

      const group_ids = groups.map((group) => group.id);
      return this.createMany(createMessageDto, group_ids, file);
    } catch (error) {
      this.logger.error(
        `Failed to create message: ${(error as Error).message}`
      );
      return APIResponse.error({
        message: `Failed to create message: ${(error as Error).message}`,
        statusCode: 500,
      });
    }
  }

  async createMany(
    createMessageDto: CreateMessageDto,
    group_ids: number[],
    file?: Express.Multer.File
  ) {
    try {
      const validationResponse = this.validateMessageContent(
        createMessageDto,
        file
      );
      if (!validationResponse.data) {
        return validationResponse;
      }

      const content = createMessageDto.content || '';
      const messages = group_ids.map((group_id) => ({
        content,
        content_type: createMessageDto.content_type,
        group_id,
      }));

      const createdMessages = await this.dbService.db
        .insert(messageSchema)
        .values(messages)
        .returning();

      if (file && createMessageDto.content_type !== MESSAGE_CONTENT_TYPE.TEXT) {
        for (const message of createdMessages) {
          await this.uploadMessageFile(file, message.id);
        }
      }

      return APIResponse.success({
        message: 'Messages created successfully',
        statusCode: 201,
        data: createdMessages,
      });
    } catch (error) {
      this.logger.error(
        `Failed to create messages: ${(error as Error).message}`
      );
      return APIResponse.error({
        message: `Failed to create messages: ${(error as Error).message}`,
        statusCode: 500,
      });
    }
  }

  async findAll(params?: { page?: string; limit?: string; group_id?: string }) {
    try {
      const {
        page = '1',
        limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString(),
        group_id,
      } = params || {};

      const offset = getPageOffset(page, limit);
      const whereClauses: SQL[] = [];

      if (group_id) {
        const gid = Number(group_id);
        if (Number.isNaN(gid)) {
          return APIResponse.error({
            message: 'group_id must be a number',
            statusCode: 400,
          });
        }
        whereClauses.push(eq(messageSchema.group_id, gid));
      }

      const baseQuery = this.dbService.db
        .select({
          id: messageSchema.id,
          content: messageSchema.content,
          content_type: messageSchema.content_type,
          group_id: messageSchema.group_id,
          created_at: messageSchema.created_at,
          updated_at: messageSchema.updated_at,
        })
        .from(messageSchema)
        .orderBy(desc(messageSchema.created_at))
        .offset(offset)
        .limit(Number(limit));

      const countQuery = this.dbService.db
        .select({ count: sql<number>`COUNT(*)` })
        .from(messageSchema);

      const whereExpr =
        whereClauses.length > 0 ? and(...whereClauses) : undefined;

      const [countRows, results] = await Promise.all([
        whereExpr ? countQuery.where(whereExpr) : countQuery,
        whereExpr ? baseQuery.where(whereExpr) : baseQuery,
      ]);

      const totalCount = Number(countRows[0]?.count ?? 0);
      const groupedMessages = results.reduce(
        (acc, message) => {
          const date = new Date(message.created_at).toISOString().split('T')[0];

          const existingDateGroup = acc.find((group) => group.date === date);

          if (existingDateGroup) {
            existingDateGroup.messages.push(message);
          } else {
            acc.push({
              date,
              messages: [message],
            });
          }

          return acc;
        },
        [] as Array<{ date: string; messages: typeof results }>
      );

      return APIResponse.success({
        message: 'Messages retrieved successfully',
        statusCode: 200,
        data: groupedMessages,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          count: totalCount,
          totalPages: Math.ceil(totalCount / Number(limit)),
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to retrieve messages: ${(error as Error).message}`
      );
      return APIResponse.error({
        message: `Failed to retrieve messages: ${(error as Error).message}`,
        statusCode: 500,
      });
    }
  }

  async findOne(id: number) {
    try {
      const rows = await this.dbService.db
        .select({
          id: messageSchema.id,
          content: messageSchema.content,
          content_type: messageSchema.content_type,
          group_id: messageSchema.group_id,
          created_at: messageSchema.created_at,
          updated_at: messageSchema.updated_at,

          group_name: groupSchema.name,
          group_description: groupSchema.description,

          location_id: locationSchema.id,
          location_name: locationSchema.name,
          location_city: locationSchema.city,
          location_state: locationSchema.state,

          coach_id: coachSchema.id,
          coach_first_name: userSchema.first_name,
          coach_last_name: userSchema.last_name,
          coach_email: userSchema.email,
        })
        .from(messageSchema)
        .leftJoin(groupSchema, eq(messageSchema.group_id, groupSchema.id))
        .leftJoin(
          locationSchema,
          eq(groupSchema.location_id, locationSchema.id)
        )
        .leftJoin(coachSchema, eq(groupSchema.coach_id, coachSchema.id))
        .leftJoin(userSchema, eq(coachSchema.user_id, userSchema.id))
        .where(eq(messageSchema.id, id))
        .limit(1);

      if (rows.length === 0) {
        return APIResponse.error({
          message: 'Message not found',
          statusCode: 404,
        });
      }

      return APIResponse.success({
        message: 'Message retrieved successfully',
        statusCode: 200,
        data: rows[0],
      });
    } catch (error) {
      this.logger.error(
        `Failed to retrieve message: ${(error as Error).message}`
      );
      return APIResponse.error({
        message: `Failed to retrieve message: ${(error as Error).message}`,
        statusCode: 500,
      });
    }
  }

  async update(id: number, updateMessageDto: UpdateMessageDto) {
    try {
      const existing = await this.dbService.db
        .select()
        .from(messageSchema)
        .where(eq(messageSchema.id, id))
        .limit(1);

      if (existing.length === 0) {
        return APIResponse.error({
          message: 'Message not found',
          statusCode: 404,
        });
      }

      const [updated] = await this.dbService.db
        .update(messageSchema)
        .set({
          ...updateMessageDto,
          updated_at: new Date(),
        })
        .where(eq(messageSchema.id, id))
        .returning();

      this.logger.log(`Message updated successfully with ID: ${id}`);

      return APIResponse.success({
        message: 'Message updated successfully',
        statusCode: 200,
        data: updated,
      });
    } catch (error) {
      this.logger.error(
        `Failed to update message: ${(error as Error).message}`
      );
      return APIResponse.error({
        message: `Failed to update message: ${(error as Error).message}`,
        statusCode: 500,
      });
    }
  }

  async remove(id: number) {
    try {
      const existing = await this.dbService.db
        .select()
        .from(messageSchema)
        .where(eq(messageSchema.id, id))
        .limit(1);

      if (existing.length === 0) {
        return APIResponse.error({
          message: 'Message not found',
          statusCode: 404,
        });
      }

      const message = existing[0];

      if (
        message.content_type !== 'text' &&
        message.content &&
        message.content.startsWith('/')
      ) {
        try {
          const fileKey = message.content.startsWith('/')
            ? message.content.substring(1)
            : message.content;

          await this.fileStorageService.deleteFile(fileKey);
          this.logger.log(
            `File deleted from DigitalOcean for message ${id}: ${fileKey}`
          );
        } catch (fileDeleteError) {
          this.logger.error(
            `Failed to delete file from DigitalOcean for message ${id}: ${(fileDeleteError as Error).message}`
          );
        }
      }

      await this.dbService.db
        .delete(messageSchema)
        .where(eq(messageSchema.id, id));

      this.logger.log(`Message deleted successfully with ID: ${id}`);

      return APIResponse.success({
        message: 'Message deleted successfully',
        statusCode: 200,
      });
    } catch (error) {
      this.logger.error(
        `Failed to delete message: ${(error as Error).message}`
      );
      return APIResponse.error({
        message: `Failed to delete message: ${(error as Error).message}`,
        statusCode: 500,
      });
    }
  }

  async uploadMessageFile(file: Express.Multer.File, id: number) {
    try {
      const fileKey = await this.fileStorageService.uploadFile(
        file,
        'messages',
        id
      );

      const message = await this.dbService.db
        .select()
        .from(messageSchema)
        .where(eq(messageSchema.id, id))
        .limit(1);

      if (message.length === 0) {
        return APIResponse.error({
          message: 'Message not found',
          statusCode: 404,
        });
      }

      const updatedMessage = await this.dbService.db
        .update(messageSchema)
        .set({ content: fileKey.relativePath })
        .where(eq(messageSchema.id, id))
        .returning();

      return APIResponse.success({
        message: 'Message file uploaded successfully',
        statusCode: 200,
        data: updatedMessage,
      });
    } catch (error) {
      this.logger.error(
        `Failed to upload message file: ${(error as Error).message}`
      );
      return APIResponse.error({
        message: `Failed to upload message file: ${(error as Error).message}`,
        statusCode: 500,
      });
    }
  }

  validateMessageContent(
    createMessageDto: CreateMessageDto,
    file?: Express.Multer.File
  ) {
    if (createMessageDto.content_type === MESSAGE_CONTENT_TYPE.TEXT) {
      if (!createMessageDto.content) {
        return APIResponse.error({
          message: 'Content is required when content_type is text',
          statusCode: 400,
        });
      }
      if (file) {
        return APIResponse.error({
          message: 'File must not be provided when content_type is text',
          statusCode: 400,
        });
      }
    }

    if (createMessageDto.content_type !== MESSAGE_CONTENT_TYPE.TEXT) {
      if (!file) {
        return APIResponse.error({
          message: 'File is required when content_type is not text',
          statusCode: 400,
        });
      }
    }

    return APIResponse.success({
      message: 'Message content is valid',
      statusCode: 200,
      data: true,
    });
  }
}
