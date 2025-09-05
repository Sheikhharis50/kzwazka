import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../db/drizzle.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { eventSchema } from '../db/schemas/eventSchema';
import { eq, and, gte, lte, ilike, desc, sql, SQL } from 'drizzle-orm';
import { Event } from '../db/schemas/eventSchema';
import { APP_CONSTANTS, getPageOffset } from '../utils';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(private readonly dbService: DatabaseService) {}

  async create(createEventDto: CreateEventDto, userId: number): Promise<Event> {
    try {
      // Validate that min_age is less than max_age
      if (createEventDto.min_age >= createEventDto.max_age) {
        throw new BadRequestException(
          'Minimum age must be less than maximum age'
        );
      }

      // Validate that opening_time is before closing_time
      const openingTime = new Date(createEventDto.opening_time);
      const closingTime = new Date(createEventDto.closing_time);
      if (openingTime >= closingTime) {
        throw new BadRequestException(
          'Opening time must be before closing time'
        );
      }

      // Validate that event_date is not in the past
      const eventDate = new Date(createEventDto.event_date);
      if (eventDate < new Date()) {
        throw new BadRequestException('Event date cannot be in the past');
      }

      const [event] = await this.dbService.db
        .insert(eventSchema)
        .values({
          ...createEventDto,
          created_by: userId,
          location_id: createEventDto.location_id,
          event_date: eventDate,
          opening_time: openingTime,
          closing_time: closingTime,
        })
        .returning();

      this.logger.log(`Event created successfully with ID: ${event.id}`);
      return event;
    } catch (error) {
      this.logger.error(`Failed to create event: ${(error as Error).message}`);
      throw error;
    }
  }

  async findAll(query: QueryEventDto): Promise<{
    events: Event[];
    total: number;
    page: string;
    limit: string;
    totalPages: number;
  }> {
    try {
      const {
        page = '1',
        limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString(),
        ...filters
      } = query;
      const offset = getPageOffset(page, limit);

      // Build where conditions
      const whereConditions: SQL<unknown>[] = [];

      if (filters.search) {
        whereConditions.push(ilike(eventSchema.title, `%${filters.search}%`));
      }

      if (filters.status) {
        whereConditions.push(eq(eventSchema.status, filters.status));
      }

      if (filters.location_id) {
        whereConditions.push(eq(eventSchema.location_id, filters.location_id));
      }

      if (filters.min_age !== undefined) {
        whereConditions.push(gte(eventSchema.min_age, filters.min_age));
      }

      if (filters.max_age !== undefined) {
        whereConditions.push(lte(eventSchema.max_age, filters.max_age));
      }

      if (filters.from_date) {
        whereConditions.push(
          gte(eventSchema.event_date, new Date(filters.from_date))
        );
      }

      if (filters.to_date) {
        whereConditions.push(
          lte(eventSchema.event_date, new Date(filters.to_date))
        );
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Get total count
      const countResult = await this.dbService.db
        .select({ count: sql<number>`count(*)` })
        .from(eventSchema)
        .where(whereClause);

      const total = Number(countResult[0]?.count || 0);

      // Get events with pagination
      const events = await this.dbService.db
        .select()
        .from(eventSchema)
        .where(whereClause)
        .orderBy(desc(eventSchema.created_at))
        .limit(Number(limit))
        .offset(offset);

      const totalPages = Math.ceil(total / Number(limit));

      return {
        events,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch events: ${(error as Error).message}`);
      throw error;
    }
  }

  async findOne(id: number): Promise<Event> {
    try {
      const [event] = await this.dbService.db
        .select()
        .from(eventSchema)
        .where(eq(eventSchema.id, id));

      if (!event) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

      return event;
    } catch (error) {
      this.logger.error(
        `Failed to fetch event ${id}: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async update(
    id: number,
    updateEventDto: UpdateEventDto,
    userId: number
  ): Promise<Event> {
    try {
      // Check if event exists
      const existingEvent = await this.findOne(id);

      // Check if user has permission to update (creator or admin)
      if (existingEvent.created_by !== userId) {
        throw new BadRequestException('You can only update events you created');
      }

      // Validate age range if both are provided
      if (
        updateEventDto.min_age !== undefined &&
        updateEventDto.max_age !== undefined
      ) {
        if (updateEventDto.min_age >= updateEventDto.max_age) {
          throw new BadRequestException(
            'Minimum age must be less than maximum age'
          );
        }
      }

      // Validate time range if both are provided
      if (updateEventDto.opening_time && updateEventDto.closing_time) {
        const openingTime = new Date(updateEventDto.opening_time);
        const closingTime = new Date(updateEventDto.closing_time);
        if (openingTime >= closingTime) {
          throw new BadRequestException(
            'Opening time must be before closing time'
          );
        }
      }

      // Validate event date if provided
      if (updateEventDto.event_date) {
        const eventDate = new Date(updateEventDto.event_date);
        if (eventDate < new Date()) {
          throw new BadRequestException('Event date cannot be in the past');
        }
      }

      // Convert string dates to Date objects if provided
      const updateData = {
        ...updateEventDto,
        updated_at: new Date(),
      } as {
        [key: string]: string | number | Date | undefined;
      };

      if (updateEventDto.event_date) {
        updateData.event_date = new Date(updateEventDto.event_date);
      }
      if (updateEventDto.opening_time) {
        updateData.opening_time = new Date(updateEventDto.opening_time);
      }
      if (updateEventDto.closing_time) {
        updateData.closing_time = new Date(updateEventDto.closing_time);
      }

      const [updatedEvent] = await this.dbService.db
        .update(eventSchema)
        .set(updateData)
        .where(eq(eventSchema.id, id))
        .returning();

      this.logger.log(`Event ${id} updated successfully`);
      return updatedEvent;
    } catch (error: any) {
      this.logger.error(
        `Failed to update event ${id}: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async remove(id: number, userId: number): Promise<void> {
    try {
      // Check if event exists
      const existingEvent = await this.findOne(id);

      // Check if user has permission to delete (creator or admin)
      if (existingEvent.created_by !== userId) {
        throw new BadRequestException('You can only delete events you created');
      }

      // Check if event is in the future
      if (existingEvent.event_date > new Date()) {
        throw new BadRequestException('Cannot delete future events');
      }

      await this.dbService.db.delete(eventSchema).where(eq(eventSchema.id, id));

      this.logger.log(`Event ${id} deleted successfully`);
    } catch (error: any) {
      this.logger.error(
        `Failed to delete event ${id}: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
