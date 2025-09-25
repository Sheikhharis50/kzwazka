import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../db/drizzle.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { eventSchema } from '../db/schemas/eventSchema';
import { eq, and, gte, lte, ilike, desc, sql, SQL, inArray } from 'drizzle-orm';
import { Event } from '../db/schemas/eventSchema';
import { EVENT_TYPE } from '../utils/constants';
import { combineDateAndTime } from '../utils/date.utils';
import { groupSchema } from '../db/schemas/groupSchema';
import { locationSchema } from '../db/schemas/locationSchema';
import { APIResponse } from 'src/utils/response';
import { coachSchema } from '../db/schemas/coachSchema';
import { userSchema } from '../db/schemas/userSchema';
import { groupSessionSchema } from '../db/schemas/groupSessionSchema';
import {
  EventWithFullDetails,
  RawEventData,
  GroupSessionData,
  GroupLocationData,
  LocationData,
  SessionData,
} from './event.types';

@Injectable()
export class EventService {
  private readonly logger = new Logger(EventService.name);

  constructor(private readonly dbService: DatabaseService) {}

  // Helper function to get base event query with all joins
  private getBaseEventQuery() {
    return (
      this.dbService.db
        .select({
          // Event fields
          id: eventSchema.id,
          title: eventSchema.title,
          description: eventSchema.description,
          location_id: eventSchema.location_id,
          start_date: eventSchema.start_date,
          end_date: eventSchema.end_date,
          opening_time: eventSchema.opening_time,
          closing_time: eventSchema.closing_time,
          event_type: eventSchema.event_type,
          group_id: eventSchema.group_id,
          created_at: eventSchema.created_at,
          updated_at: eventSchema.updated_at,
          coach_id: eventSchema.coach_id,

          // Group data
          group_name: groupSchema.name,
          group_min_age: groupSchema.min_age,
          group_max_age: groupSchema.max_age,
          group_skill_level: groupSchema.skill_level,
          group_location_id: groupSchema.location_id,

          // Event location (for ONE_TIME events)
          event_location_name: locationSchema.name,
          event_location_address1: locationSchema.address1,
          event_location_address2: locationSchema.address2,
          event_location_city: locationSchema.city,
          event_location_state: locationSchema.state,
          event_location_country: locationSchema.country,

          // Coach data with SQL COALESCE for priority (event coach first, then group coach)
          coach_first_name: sql<string>`COALESCE(event_user.first_name, group_user.first_name)`,
          coach_last_name: sql<string>`COALESCE(event_user.last_name, group_user.last_name)`,
        })
        .from(eventSchema)
        // Core joins
        .innerJoin(groupSchema, eq(eventSchema.group_id, groupSchema.id))
        .leftJoin(
          locationSchema,
          eq(eventSchema.location_id, locationSchema.id)
        )
        // Group coach (always exists)
        .innerJoin(
          sql`${coachSchema} AS group_coach`,
          sql`group_coach.id = ${groupSchema.coach_id}`
        )
        .innerJoin(
          sql`${userSchema} AS group_user`,
          sql`group_user.id = group_coach.user_id`
        )
        // Event coach (optional - only for events with specific coach)
        .leftJoin(
          sql`${coachSchema} AS event_coach`,
          sql`event_coach.id = ${eventSchema.coach_id}`
        )
        .leftJoin(
          sql`${userSchema} AS event_user`,
          sql`event_user.id = event_coach.user_id`
        )
    );
  }

  // Helper function to get group sessions for multiple groups
  private async getGroupSessions(
    groupIds: number[]
  ): Promise<GroupSessionData[]> {
    return this.dbService.db
      .select({
        id: groupSessionSchema.id,
        group_id: groupSessionSchema.group_id,
        start_time: groupSessionSchema.start_time,
        end_time: groupSessionSchema.end_time,
        day: groupSessionSchema.day,
      })
      .from(groupSessionSchema)
      .where(inArray(groupSessionSchema.group_id, groupIds));
  }

  // Helper function to get group sessions for a single group
  private async getGroupSessionsForGroup(
    groupId: number
  ): Promise<SessionData[]> {
    return this.dbService.db
      .select({
        id: groupSessionSchema.id,
        start_time: groupSessionSchema.start_time,
        end_time: groupSessionSchema.end_time,
        day: groupSessionSchema.day,
      })
      .from(groupSessionSchema)
      .where(eq(groupSessionSchema.group_id, groupId));
  }

  // Helper function to get group locations for multiple groups
  private async getGroupLocations(
    groupIds: number[]
  ): Promise<GroupLocationData[]> {
    return this.dbService.db
      .select({
        group_id: groupSchema.id,
        location_id: locationSchema.id,
        location_name: locationSchema.name,
        location_address1: locationSchema.address1,
        location_address2: locationSchema.address2,
        location_city: locationSchema.city,
        location_state: locationSchema.state,
        location_country: locationSchema.country,
      })
      .from(groupSchema)
      .leftJoin(locationSchema, eq(groupSchema.location_id, locationSchema.id))
      .where(inArray(groupSchema.id, groupIds));
  }

  // Helper function to get group location for a single group
  private async getGroupLocationForGroup(
    groupId: number
  ): Promise<GroupLocationData | undefined> {
    const [result] = await this.dbService.db
      .select({
        group_id: groupSchema.id,
        location_id: locationSchema.id,
        location_name: locationSchema.name,
        location_address1: locationSchema.address1,
        location_address2: locationSchema.address2,
        location_city: locationSchema.city,
        location_state: locationSchema.state,
        location_country: locationSchema.country,
      })
      .from(groupSchema)
      .leftJoin(locationSchema, eq(groupSchema.location_id, locationSchema.id))
      .where(eq(groupSchema.id, groupId));

    return result;
  }

  // Helper function to create lookup maps for group sessions
  private createSessionsLookupMap(
    groupSessions: GroupSessionData[]
  ): Record<number, SessionData[]> {
    return groupSessions.reduce(
      (acc, session) => {
        if (!session.group_id) return acc;
        if (!acc[session.group_id]) acc[session.group_id] = [];
        acc[session.group_id].push({
          id: session.id,
          start_time: session.start_time,
          end_time: session.end_time,
          day: session.day,
        });
        return acc;
      },
      {} as Record<number, SessionData[]>
    );
  }

  // Helper function to create lookup map for group locations
  private createGroupLocationsLookupMap(
    groupLocations: GroupLocationData[]
  ): Record<number, LocationData> {
    return groupLocations.reduce(
      (acc, loc) => {
        acc[loc.group_id] = {
          id: loc.location_id,
          name: loc.location_name,
          address1: loc.location_address1,
          address2: loc.location_address2,
          city: loc.location_city,
          state: loc.location_state,
          country: loc.location_country,
        };
        return acc;
      },
      {} as Record<number, LocationData>
    );
  }

  // Helper function to determine location data based on event type
  private determineLocationData(
    event: RawEventData,
    groupLocationsByGroupId?: Record<number, LocationData>,
    groupLocation?: GroupLocationData
  ): LocationData {
    if (event.event_type === EVENT_TYPE.TRAINING) {
      if (groupLocationsByGroupId) {
        return (
          groupLocationsByGroupId[event.group_id] || {
            id: null,
            name: null,
            address1: null,
            address2: null,
            city: null,
            state: null,
            country: null,
          }
        );
      } else if (groupLocation) {
        return {
          id: groupLocation.location_id,
          name: groupLocation.location_name,
          address1: groupLocation.location_address1,
          address2: groupLocation.location_address2,
          city: groupLocation.location_city,
          state: groupLocation.location_state,
          country: groupLocation.location_country,
        };
      }
    }

    return {
      id: event.location_id,
      name: event.event_location_name,
      address1: event.event_location_address1,
      address2: event.event_location_address2,
      city: event.event_location_city,
      state: event.event_location_state,
      country: event.event_location_country,
    };
  }

  // Helper function to transform event data to EventWithFullDetails
  private transformEventToFullDetails(
    event: RawEventData,
    sessions: SessionData[],
    locationData: LocationData
  ): EventWithFullDetails {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      location_id: event.location_id,
      start_date: event.start_date,
      end_date: event.end_date,
      opening_time: event.opening_time,
      closing_time: event.closing_time,
      event_type: event.event_type,
      group_id: event.group_id,
      created_at: event.created_at,
      updated_at: event.updated_at,
      coach_id: event.coach_id,
      coach_first_name: event.coach_first_name,
      coach_last_name: event.coach_last_name,
      group: {
        id: event.group_id,
        name: event.group_name,
        min_age: event.group_min_age,
        max_age: event.group_max_age,
        skill_level: event.group_skill_level,
        sessions: sessions.map((session) => ({
          id: session.id,
          start_time: session.start_time,
          end_time: session.end_time,
          day: session.day,
        })),
      },
      location: locationData,
    };
  }

  async create(
    createEventDto: CreateEventDto
  ): Promise<APIResponse<Event | undefined>> {
    try {
      const startDate = new Date(createEventDto.start_date)
        .toISOString()
        .split('T')[0];

      if (startDate < new Date().toISOString().split('T')[0]) {
        return APIResponse.error<undefined>({
          message: 'Start date cannot be in the past',
          statusCode: 400,
        });
      }

      if (createEventDto.end_date) {
        const endDate = new Date(createEventDto.end_date)
          .toISOString()
          .split('T')[0];
        if (endDate < new Date().toISOString().split('T')[0]) {
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
              eq(
                eventSchema.location_id,
                createEventDto.location_id || groupSchema.location_id
              ),
              eq(eventSchema.start_date, new Date(startDate)),
              eq(eventSchema.end_date, new Date(endDate))
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
        ? combineDateAndTime(new Date(startDate), createEventDto.opening_time)
        : null;
      const closing_time = createEventDto.closing_time
        ? combineDateAndTime(
            createEventDto.end_date
              ? new Date(createEventDto.end_date)
              : new Date(startDate),
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
            start_date: new Date(startDate),
            location_id: null,
            coach_id: null,
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
          start_date: new Date(startDate),
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
      const whereConditions: SQL<unknown>[] = [];

      if (query.search) {
        whereConditions.push(ilike(eventSchema.title, `%${query.search}%`));
      }
      if (query.group_id) {
        whereConditions.push(eq(eventSchema.group_id, query.group_id));
      }
      if (query.location_id) {
        whereConditions.push(eq(eventSchema.location_id, query.location_id));
      }
      if (query.date) {
        // Filter by month - get start and end of the month
        const inputDate = new Date(query.date);
        const year = inputDate.getFullYear();
        const month = inputDate.getMonth();

        // First day of the month
        const startOfMonth = new Date(year, month, 1);
        // Last day of the month
        const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

        whereConditions.push(
          and(
            gte(eventSchema.start_date, startOfMonth),
            lte(eventSchema.start_date, endOfMonth)
          )!
        );
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Get count for pagination
      const [{ count }] = await this.dbService.db
        .select({ count: sql<number>`count(*)` })
        .from(eventSchema)
        .where(whereClause);

      if (count === 0) {
        return APIResponse.success<EventWithFullDetails[]>({
          data: [],
          message: 'Events fetched successfully',
          statusCode: 200,
        });
      }

      // Get events with details using helper function
      const eventsWithDetails: RawEventData[] = await this.getBaseEventQuery()
        .where(whereClause)
        .orderBy(desc(eventSchema.created_at));

      // Get unique group IDs for batch queries
      const groupIds = [
        ...new Set(eventsWithDetails.map((event) => event.group_id)),
      ];

      // Batch fetch sessions and group locations using helper functions
      const [groupSessions, groupLocations] = await Promise.all([
        this.getGroupSessions(groupIds),
        this.getGroupLocations(groupIds),
      ]);

      // Create lookup maps using helper functions
      const sessionsByGroupId = this.createSessionsLookupMap(groupSessions);
      const groupLocationsByGroupId =
        this.createGroupLocationsLookupMap(groupLocations);

      // Transform results using helper function
      const transformedEvents: EventWithFullDetails[] = eventsWithDetails.map(
        (event) => {
          const locationData = this.determineLocationData(
            event,
            groupLocationsByGroupId
          );
          const sessions = sessionsByGroupId[event.group_id] || [];
          return this.transformEventToFullDetails(
            event,
            sessions,
            locationData
          );
        }
      );

      return APIResponse.success<EventWithFullDetails[]>({
        data: transformedEvents,
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
  ): Promise<APIResponse<EventWithFullDetails | undefined>> {
    try {
      const [event] = await this.getBaseEventQuery()
        .where(eq(eventSchema.id, id))
        .orderBy(desc(eventSchema.created_at));

      if (!event) {
        return APIResponse.error<undefined>({
          message: `Event with ID ${id} not found`,
          statusCode: 404,
        });
      }

      // Get group sessions and location using helper functions
      const [groupSessions, groupLocation] = await Promise.all([
        this.getGroupSessionsForGroup(event.group_id),
        this.getGroupLocationForGroup(event.group_id),
      ]);

      // Determine location data using helper function
      const locationData = this.determineLocationData(
        event,
        undefined,
        groupLocation
      );

      // Transform event using helper function
      const transformedEvent = this.transformEventToFullDetails(
        event,
        groupSessions,
        locationData
      );

      return APIResponse.success<EventWithFullDetails>({
        data: transformedEvent,
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
