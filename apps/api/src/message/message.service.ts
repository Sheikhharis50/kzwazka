import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { DatabaseService } from '../db/drizzle.service';
import { eq, desc, sql } from 'drizzle-orm';
import {
  messageSchema,
  groupSchema,
  locationSchema,
  coachSchema,
} from '../db/schemas';
import { getPageOffset } from '../utils/pagination';
import { APP_CONSTANTS } from '../utils/constants';

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(private readonly dbService: DatabaseService) {}

  async create(createMessageDto: CreateMessageDto) {
    try {
      // Broadcast when group_id is not provided
      if (!createMessageDto.group_id) {
        const groups = await this.dbService.db
          .select({ id: groupSchema.id })
          .from(groupSchema);

        if (groups.length === 0) {
          throw new BadRequestException('No groups found to send messages to');
        }

        const now = new Date();
        const values = groups.map((g) => ({
          ...createMessageDto,
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
          ...createMessageDto,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning();

      this.logger.log(`Message created successfully with ID: ${created.id}`);

      return {
        message: 'Message created successfully',
        data: created,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create message: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async findAll(params?: { page?: string; limit?: string; group_id?: number }) {
    try {
      const {
        page = '1',
        limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString(),
        group_id,
      } = params || {};

      const offset = getPageOffset(page, limit);

      // FLATTENED projection to avoid PgColumn->string errors
      const baseQuery = this.dbService.db
        .select({
          id: messageSchema.id,
          content: messageSchema.content,
          content_type: messageSchema.content_type,
          group_id: messageSchema.group_id,
          created_at: messageSchema.created_at,
          updated_at: messageSchema.updated_at,

          // group (flattened)
          group_name: groupSchema.name,
          group_description: groupSchema.description,

          // location (flattened)
          location_id: locationSchema.id,
          location_name: locationSchema.name,
          location_city: locationSchema.city,
          location_state: locationSchema.state,

          // coach (flattened)
          coach_id: coachSchema.id,
          coach_name: coachSchema.name,
          coach_email: coachSchema.email,
        })
        .from(messageSchema)
        .leftJoin(groupSchema, eq(messageSchema.group_id, groupSchema.id))
        .leftJoin(
          locationSchema,
          eq(groupSchema.location_id, locationSchema.id)
        )
        .leftJoin(coachSchema, eq(groupSchema.coach_id, coachSchema.id));

      // DO NOT reassign after .where(); create a new variable
      const filteredQuery =
        group_id != null
          ? baseQuery.where(eq(messageSchema.group_id, group_id))
          : baseQuery;

      // COUNT(*) with the same filter
      const countRows =
        group_id != null
          ? await this.dbService.db
              .select({ count: sql<number>`COUNT(*)` })
              .from(messageSchema)
              .where(eq(messageSchema.group_id, group_id))
          : await this.dbService.db
              .select({ count: sql<number>`COUNT(*)` })
              .from(messageSchema);

      const results = await filteredQuery
        .orderBy(desc(messageSchema.created_at))
        .offset(offset)
        .limit(Number(limit));

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
          coach_name: coachSchema.name,
          coach_email: coachSchema.email,
        })
        .from(messageSchema)
        .leftJoin(groupSchema, eq(messageSchema.group_id, groupSchema.id))
        .leftJoin(
          locationSchema,
          eq(groupSchema.location_id, locationSchema.id)
        )
        .leftJoin(coachSchema, eq(groupSchema.coach_id, coachSchema.id))
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
