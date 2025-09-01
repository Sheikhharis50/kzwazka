import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
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

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly fileStorageService: FileStorageService
  ) {}

  async create(createMessageDto: CreateMessageDto, file?: Express.Multer.File) {
    try {
      let content: string;
      let messageId: number;

      // Handle file upload for non-text messages
      if (createMessageDto.content_type !== MESSAGE_CONTENT_TYPE.TEXT) {
        if (!file) {
          throw new BadRequestException(
            `File is required when content_type is '${createMessageDto.content_type}'. Please provide a file in the request.`
          );
        }

        // Validate file properties
        if (!file.originalname || !file.mimetype) {
          throw new BadRequestException(
            'Invalid file: missing originalname or mimetype'
          );
        }

        // Validate file size (10MB limit)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size && file.size > maxSize) {
          throw new BadRequestException(
            `File size exceeds limit. Maximum allowed: 10MB, received: ${(file.size / 1024 / 1024).toFixed(2)}MB`
          );
        }

        // For file messages, we need to create the message first to get the ID
        // Then upload the file using that ID
        if (!createMessageDto.group_id) {
          // Broadcast message - create all messages first
          const groups = await this.dbService.db
            .select({ id: groupSchema.id })
            .from(groupSchema);

          if (groups.length === 0) {
            throw new BadRequestException(
              'No groups found to send messages to'
            );
          }

          const now = new Date();
          const values = groups.map((g) => ({
            content: '', // Temporary content, will be updated after file upload
            content_type: createMessageDto.content_type,
            group_id: g.id,
            created_at: now,
            updated_at: now,
          }));

          const inserted = await this.dbService.db
            .insert(messageSchema)
            .values(values)
            .returning();

          // Upload file for each message
          const uploadPromises = inserted.map(async (msg) => {
            const uploadResult = await this.fileStorageService.uploadFile(
              file,
              'messages',
              msg.id
            );

            // Update the message with the relative path
            await this.dbService.db
              .update(messageSchema)
              .set({ content: uploadResult.relativePath })
              .where(eq(messageSchema.id, msg.id));

            return { ...msg, content: uploadResult.relativePath };
          });

          const updatedMessages = await Promise.all(uploadPromises);

          this.logger.log(
            `Created ${updatedMessages.length} messages with files for all groups`
          );
          return {
            message: `Messages created successfully for ${updatedMessages.length} groups`,
            data: updatedMessages,
            count: updatedMessages.length,
          };
        } else {
          // Single group message - create message first
          const [created] = await this.dbService.db
            .insert(messageSchema)
            .values({
              content: '', // Temporary content
              content_type: createMessageDto.content_type,
              group_id: createMessageDto.group_id,
              created_at: new Date(),
              updated_at: new Date(),
            })
            .returning();

          messageId = created.id;

          // Upload file using the message ID
          const uploadResult = await this.fileStorageService.uploadFile(
            file,
            'messages',
            messageId
          );

          content = uploadResult.relativePath;

          // Update the message with the file URL
          const [updated] = await this.dbService.db
            .update(messageSchema)
            .set({ content })
            .where(eq(messageSchema.id, messageId))
            .returning();

          this.logger.log(
            `Message created successfully with ID: ${messageId} and file: ${uploadResult.key}`
          );

          return {
            message: 'Message created successfully',
            data: updated,
          };
        }
      } else {
        // Text message
        if (
          !createMessageDto.content ||
          createMessageDto.content.trim() === ''
        ) {
          throw new BadRequestException(
            'Content is required when content_type is text'
          );
        }
        if (file) {
          throw new BadRequestException(
            'File must not be provided when content_type is text'
          );
        }
        content = createMessageDto.content.trim();

        // Broadcast when group_id is not provided
        if (!createMessageDto.group_id) {
          const groups = await this.dbService.db
            .select({ id: groupSchema.id })
            .from(groupSchema);

          if (groups.length === 0) {
            throw new BadRequestException(
              'No groups found to send messages to'
            );
          }

          const now = new Date();
          const values = groups.map((g) => ({
            content,
            content_type: createMessageDto.content_type,
            group_id: g.id,
            created_at: now,
            updated_at: now,
          }));

          const inserted = await this.dbService.db
            .insert(messageSchema)
            .values(values)
            .returning();

          this.logger.log(`Created ${inserted.length} messages for all groups`);
          return {
            message: `Messages created successfully for ${inserted.length} groups`,
            data: inserted,
            count: inserted.length,
          };
        }

        // Single group message
        const [created] = await this.dbService.db
          .insert(messageSchema)
          .values({
            content,
            content_type: createMessageDto.content_type,
            group_id: createMessageDto.group_id,
            created_at: new Date(),
            updated_at: new Date(),
          })
          .returning();

        this.logger.log(`Message created successfully with ID: ${created.id}`);

        return {
          message: 'Message created successfully',
          data: created,
        };
      }
    } catch (error) {
      this.logger.error(
        `Failed to create message: ${(error as Error).message}`
      );
      throw error;
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
          throw new BadRequestException('group_id must be a number');
        }
        whereClauses.push(eq(messageSchema.group_id, gid));
      }

      // --- Base (lean) selection: messages only ---
      const baseSelect = this.dbService.db
        .select({
          id: messageSchema.id,
          content: messageSchema.content,
          content_type: messageSchema.content_type,
          group_id: messageSchema.group_id,
          created_at: messageSchema.created_at,
          updated_at: messageSchema.updated_at,
        })
        .from(messageSchema);

      const whereExpr =
        whereClauses.length > 0 ? and(...whereClauses) : undefined;

      // Count with SAME filter
      const countQuery = this.dbService.db
        .select({ count: sql<number>`COUNT(*)` })
        .from(messageSchema);

      const [countRows, results] = await Promise.all([
        whereExpr ? countQuery.where(whereExpr) : countQuery,
        (whereExpr ? baseSelect.where(whereExpr) : baseSelect)
          .orderBy(desc(messageSchema.created_at))
          .offset(offset)
          .limit(Number(limit)),
      ]);

      const totalCount = Number(countRows[0]?.count ?? 0);

      return {
        message: 'Messages retrieved successfully',
        data: results,
        page: Number(page),
        limit: Number(limit),
        count: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve messages: ${(error as Error).message}`
      );
      throw error;
    }
  }
  async findOne(id: number) {
    try {
      // FLATTENED projection here as well
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
        throw new NotFoundException('Message not found');
      }

      return {
        message: 'Message retrieved successfully',
        data: rows[0],
      };
    } catch (error) {
      this.logger.error(
        `Failed to retrieve message: ${(error as Error).message}`
      );
      throw error;
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
        throw new NotFoundException('Message not found');
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

      return {
        message: 'Message updated successfully',
        data: updated,
      };
    } catch (error) {
      this.logger.error(
        `Failed to update message: ${(error as Error).message}`
      );
      throw error;
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
        throw new NotFoundException('Message not found');
      }

      const message = existing[0];

      // If the message contains a file (non-text content type), delete it from DigitalOcean
      if (
        message.content_type !== 'text' &&
        message.content &&
        message.content.startsWith('/')
      ) {
        try {
          // Convert relative path to key by removing leading slash
          const fileKey = message.content.startsWith('/')
            ? message.content.substring(1)
            : message.content;

          // Delete the file using the key
          await this.fileStorageService.deleteFile(fileKey);
          this.logger.log(
            `File deleted from DigitalOcean for message ${id}: ${fileKey}`
          );
        } catch (fileDeleteError) {
          // Log the error but don't fail the message deletion
          this.logger.error(
            `Failed to delete file from DigitalOcean for message ${id}: ${(fileDeleteError as Error).message}`
          );
        }
      }

      // Delete the message from database
      await this.dbService.db
        .delete(messageSchema)
        .where(eq(messageSchema.id, id));

      this.logger.log(`Message deleted successfully with ID: ${id}`);

      return {
        message: 'Message deleted successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete message: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
