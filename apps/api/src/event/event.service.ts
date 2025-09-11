import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../db/drizzle.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { eventSchema } from '../db/schemas/eventSchema';
import { eq, and, gte, lte, ilike, desc, sql, SQL, inArray } from 'drizzle-orm';
import { Event, EventWithLocationAndGroup } from '../db/schemas/eventSchema';
import { APP_CONSTANTS, EVENT_TYPE, getPageOffset } from '../utils';
import { combineDateAndTime } from '../utils/date.utils';
import { groupSchema } from '../db/schemas/groupSchema';
import { locationSchema } from '../db/schemas/locationSchema';
import { APIResponse } from 'src/utils/response';
import { coachSchema } from '../db/schemas/coachSchema';
import { userSchema } from '../db/schemas/userSchema';
import { groupSessionSchema } from '../db/schemas/groupSessionSchema';
import { EventWithFullDetails } from './event.types';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(private readonly dbService: DatabaseService) {}

  async create(
    createEventDto: CreateEventDto
  ): Promise<APIResponse<Event | undefined>> {
    try {
      if (createEventDto.min_age >= createEventDto.max_age) {
        return APIResponse.error<undefined>({
          message: 'Minimum age must be less than maximum age',
          statusCode: 400,
        });
      }

      const startDate = new Date(createEventDto.start_date);
      if (startDate < new Date()) {
        return APIResponse.error<undefined>({
          message: 'Start date cannot be in the past',
          statusCode: 400,
        });
      }

      if (createEventDto.end_date) {
        const endDate = new Date(createEventDto.end_date);
        if (endDate < new Date()) {
          return APIResponse.error<undefined>({
            message: 'End date cannot be in the past',
            statusCode: 400,
          });
        }
        if (endDate < startDate) {
          return APIResponse.error<undefined>({
            message: 'End date must be after start date',
            statusCode: 400,
          });
        }
      }

      if (createEventDto.event_type === EVENT_TYPE.ONE_TIME) {
        const endDate = createEventDto.end_date
          ? new Date(createEventDto.end_date)
          : startDate;

        const existingEvents = await this.dbService.db
          .select()
          .from(eventSchema)
          .where(
            and(
              eq(eventSchema.location_id, createEventDto.location_id),
              eq(eventSchema.start_date, startDate),
              eq(eventSchema.end_date, endDate)
            )
          );

        if (existingEvents.length > 0) {
          return APIResponse.error<undefined>({
            message: 'Event already exists for this location on the same date',
            statusCode: 400,
          });
        }
      }

      const opening_time = createEventDto.opening_time
        ? combineDateAndTime(startDate, createEventDto.opening_time)
        : null;
      const closing_time = createEventDto.closing_time
        ? combineDateAndTime(
            createEventDto.end_date
              ? new Date(createEventDto.end_date)
              : startDate,
            createEventDto.closing_time
          )
        : null;

      if (createEventDto.event_type === EVENT_TYPE.TRAINING) {
        const [event] = await this.dbService.db
          .insert(eventSchema)
          .values({
            ...createEventDto,
            event_type: EVENT_TYPE.TRAINING,
            group_id: createEventDto.group_id,
            start_date: startDate,
            end_date: null,
            opening_time: null,
            closing_time: null,
          })
          .returning();
        return APIResponse.success<Event | undefined>({
          data: event,
          message: 'Training event created successfully',
          statusCode: 201,
        });
      }

      const [event] = await this.dbService.db
        .insert(eventSchema)
        .values({
          ...createEventDto,
          event_type: EVENT_TYPE.ONE_TIME,
          group_id: createEventDto.group_id,
          start_date: startDate,
          end_date: createEventDto.end_date
            ? new Date(createEventDto.end_date)
            : null,
          opening_time,
          closing_time,
        })
        .returning();

      this.logger.log(`Event created successfully with ID: ${event.id}`);
      return APIResponse.success<Event>({
        data: event,
        message: 'Event created successfully',
        statusCode: 201,
      });
    } catch (error) {
      this.logger.error(`Failed to create event: ${(error as Error).message}`);
      return APIResponse.error<undefined>({
        message: 'Failed to create event',
        statusCode: 500,
      });
    }
  }
  async findAll(
    query: QueryEventDto
  ): Promise<APIResponse<EventWithFullDetails[] | undefined>> {
    try {
      const {
        page = '1',
        limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString(),
        ...filters
      } = query;
      const offset = getPageOffset(page, limit);

      const whereConditions: SQL<unknown>[] = [];

      if (filters.search) {
        whereConditions.push(ilike(eventSchema.title, `%${filters.search}%`));
      }

      if (filters.group_id) {
        whereConditions.push(eq(eventSchema.group_id, filters.group_id));
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
          gte(eventSchema.start_date, new Date(filters.from_date))
        );
      }

      if (filters.to_date) {
        whereConditions.push(
          lte(eventSchema.end_date, new Date(filters.to_date))
        );
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // First, get the count for pagination
      const countResult = await this.dbService.db
        .select({ count: sql<number>`count(*)` })
        .from(eventSchema)
        .where(whereClause);

      const count = Number(countResult[0]?.count || 0);

      // Main query to get events with group and location data
      const eventsWithDetails = await this.dbService.db
        .select({
          // Event fields - make sure to include all required fields
          id: eventSchema.id,
          title: eventSchema.title,
          location_id: eventSchema.location_id,
          min_age: eventSchema.min_age,
          max_age: eventSchema.max_age,
          start_date: eventSchema.start_date,
          end_date: eventSchema.end_date,
          opening_time: eventSchema.opening_time,
          closing_time: eventSchema.closing_time,
          event_type: eventSchema.event_type,
          group_id: eventSchema.group_id,
          created_at: eventSchema.created_at,
          updated_at: eventSchema.updated_at,
          // Group details
          group_name: groupSchema.name,
          group_min_age: groupSchema.min_age,
          group_max_age: groupSchema.max_age,
          group_skill_level: groupSchema.skill_level,
          coach_first_name: userSchema.first_name,
          coach_last_name: userSchema.last_name,
          // Location details
          location_name: locationSchema.name,
          location_address1: locationSchema.address1,
          location_address2: locationSchema.address2,
          location_city: locationSchema.city,
          location_state: locationSchema.state,
          location_country: locationSchema.country,
        })
        .from(eventSchema)
        .where(whereClause)
        .orderBy(desc(eventSchema.created_at))
        .innerJoin(groupSchema, eq(eventSchema.group_id, groupSchema.id))
        .innerJoin(
          locationSchema,
          eq(eventSchema.location_id, locationSchema.id)
        )
        .innerJoin(coachSchema, eq(groupSchema.coach_id, coachSchema.id))
        .innerJoin(userSchema, eq(coachSchema.user_id, userSchema.id))
        .limit(Number(limit))
        .offset(offset);

      if (eventsWithDetails.length === 0) {
        return APIResponse.success<EventWithFullDetails[]>({
          data: [],
          pagination: {
            count,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(count / Number(limit)),
          },
          message: 'Events fetched successfully',
          statusCode: 200,
        });
      }

      // Get all group IDs from the events
      const groupIds = [
        ...new Set(eventsWithDetails.map((event) => event.group_id)),
      ];

      // Fetch all sessions for these groups in a separate query
      const groupSessions = await this.dbService.db
        .select({
          id: groupSessionSchema.id,
          group_id: groupSessionSchema.group_id,
          day: groupSessionSchema.day,
          start_time: groupSessionSchema.start_time,
          end_time: groupSessionSchema.end_time,
        })
        .from(groupSessionSchema)
        .where(inArray(groupSessionSchema.group_id, groupIds));

      // Group sessions by group_id for easy lookup
      const sessionsByGroupId = groupSessions.reduce(
        (acc, session) => {
          if (!acc[session.group_id]) {
            acc[session.group_id] = [];
          }
          acc[session.group_id].push({
            id: session.id,
            start_time: session.start_time,
            end_time: session.end_time,
            day: session.day,
          });
          return acc;
        },
        {} as Record<
          number,
          Array<{
            id: number;
            start_time: string;
            end_time: string;
            day: string;
          }>
        >
      );

      // Transform the data into the desired nested structure
      const transformedEvents: EventWithFullDetails[] = eventsWithDetails.map(
        (event) => ({
          id: event.id,
          title: event.title,
          location_id: event.location_id,
          min_age: event.min_age,
          max_age: event.max_age,
          start_date: event.start_date,
          end_date: event.end_date,
          opening_time: event.opening_time,
          closing_time: event.closing_time,
          event_type: event.event_type,
          group_id: event.group_id,
          created_at: event.created_at,
          updated_at: event.updated_at,
          group: {
            id: event.group_id,
            name: event.group_name,
            coach_first_name: event.coach_first_name,
            coach_last_name: event.coach_last_name,
            min_age: event.group_min_age,
            max_age: event.group_max_age,
            skill_level: event.group_skill_level,
            sessions: sessionsByGroupId[event.group_id] || [],
          },
          location: {
            id: event.location_id,
            name: event.location_name,
            address1: event.location_address1,
            address2: event.location_address2,
            city: event.location_city,
            state: event.location_state,
            country: event.location_country,
          },
        })
      );

      return APIResponse.success<EventWithFullDetails[]>({
        data: transformedEvents,
        pagination: {
          count,
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(count / Number(limit)),
        },
        message: 'Events fetched successfully',
        statusCode: 200,
      });
    } catch (error) {
      this.logger.error(`Failed to fetch events: ${(error as Error).message}`);
      return APIResponse.error<undefined>({
        message: 'Failed to fetch events',
        statusCode: 500,
      });
    }
  }
  async findOne(
    id: number
  ): Promise<APIResponse<EventWithLocationAndGroup | undefined>> {
    try {
      const [event] = await this.dbService.db
        .select()
        .from(eventSchema)
        .leftJoin(groupSchema, eq(eventSchema.group_id, groupSchema.id))
        .leftJoin(
          locationSchema,
          eq(eventSchema.location_id, locationSchema.id)
        )
        .where(eq(eventSchema.id, id));

      if (!event) {
        return APIResponse.error<undefined>({
          message: `Event with ID ${id} not found`,
          statusCode: 404,
        });
      }

      return APIResponse.success<EventWithLocationAndGroup>({
        data: event as unknown as EventWithLocationAndGroup,
        message: 'Event fetched successfully',
        statusCode: 200,
      });
    } catch (error) {
      this.logger.error(
        `Failed to fetch event ${id}: ${(error as Error).message}`
      );
      return APIResponse.error<undefined>({
        message: 'Failed to fetch event',
        statusCode: 500,
      });
    }
  }

  async update(
    id: number,
    updateEventDto: UpdateEventDto
  ): Promise<APIResponse<Event | undefined>> {
    try {
      const existingEvent = await this.findOne(id);
      if (!existingEvent) {
        return APIResponse.error<undefined>({
          message: `Event with ID ${id} not found`,
          statusCode: 404,
        });
      }

      if (
        updateEventDto.min_age !== undefined &&
        updateEventDto.max_age !== undefined
      ) {
        if (updateEventDto.min_age >= updateEventDto.max_age) {
          return APIResponse.error<undefined>({
            message: 'Minimum age must be less than maximum age',
            statusCode: 400,
          });
        }
      }

      // Validate time range if both are provided
      if (updateEventDto.opening_time && updateEventDto.closing_time) {
        const openingTime = new Date(updateEventDto.opening_time);
        const closingTime = new Date(updateEventDto.closing_time);
        if (openingTime >= closingTime) {
          return APIResponse.error<undefined>({
            message: 'Opening time must be before closing time',
            statusCode: 400,
          });
        }
      }

      // Validate event date if provided
      if (updateEventDto.start_date) {
        const startDate = new Date(updateEventDto.start_date);
        if (startDate < new Date()) {
          return APIResponse.error<undefined>({
            message: 'Event date cannot be in the past',
            statusCode: 400,
          });
        }
      }

      // Convert string dates to Date objects if provided
      const updateData = {
        ...updateEventDto,
        updated_at: new Date(),
      } as {
        [key: string]: string | number | Date | undefined;
      };

      if (updateEventDto.start_date) {
        updateData.start_date = new Date(updateEventDto.start_date);
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
      return APIResponse.success<Event>({
        data: updatedEvent,
        message: 'Event updated successfully',
        statusCode: 200,
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to update event ${id}: ${(error as Error).message}`
      );
      return APIResponse.error<undefined>({
        message: 'Failed to delete event',
        statusCode: 500,
      });
    }
  }

  async remove(id: number): Promise<APIResponse<Event | undefined>> {
    try {
      // Check if event exists
      const existingEvent = await this.findOne(id);
      if (!existingEvent) {
        return APIResponse.error<undefined>({
          message: `Event with ID ${id} not found`,
          statusCode: 404,
        });
      }

      await this.dbService.db.delete(eventSchema).where(eq(eventSchema.id, id));

      this.logger.log(`Event ${id} deleted successfully`);
      return APIResponse.success<undefined>({
        message: 'Event deleted successfully',
        statusCode: 200,
      });
    } catch (error: any) {
      this.logger.error(
        `Failed to delete event ${id}: ${(error as Error).message}`
      );
      return APIResponse.error<undefined>({
        message: 'Failed to delete event',
        statusCode: 500,
      });
    }
  }
}
