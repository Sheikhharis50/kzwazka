import { Injectable, Logger } from '@nestjs/common';
import {
  GroupSession,
  groupSessionSchema,
} from 'src/db/schemas/groupSessionSchema';
import { and, eq, ne, SQL, sql } from 'drizzle-orm';
import { DatabaseService } from '../db/drizzle.service';
import { CreateGroupSessionDto } from './dto/create-groupsession.dto';
import { APP_CONSTANTS, GROUP_SESSION_DAY } from 'src/utils/constants';
import { groupSchema } from 'src/db/schemas/groupSchema';
import { locationSchema } from 'src/db/schemas/locationSchema';
import { getPageOffset } from 'src/utils';
import { QueryGroupSessionDto } from './dto/query-groupsession.dto';
import { APIResponse } from 'src/utils/response';
import { IGroupSessionResponse } from './group.types';

interface ValidationResult {
  valid: boolean;
  error?: string;
}

@Injectable()
export class GroupSessionService {
  private readonly logger = new Logger(GroupSessionService.name);
  constructor(private readonly dbService: DatabaseService) {}

  /**
   * Validates sessions BEFORE group creation (when group doesn't exist yet)
   */
  async validateSessionsBeforeGroupCreation(
    sessions: CreateGroupSessionDto[],
    locationId: number | null
  ): Promise<ValidationResult> {
    // Basic validations
    for (const session of sessions) {
      // Check time validity
      if (session.start_time >= session.end_time) {
        return {
          valid: false,
          error: `Invalid time range for ${session.day}: start time (${session.start_time}) must be before end time (${session.end_time})`,
        };
      }

      // Check day validity
      if (!Object.values(GROUP_SESSION_DAY).includes(session.day)) {
        return {
          valid: false,
          error: `Invalid day: ${session.day}. Must be one of: ${Object.values(GROUP_SESSION_DAY).join(', ')}`,
        };
      }
    }

    // Check for internal conflicts between sessions
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        if (sessions[i].day === sessions[j].day) {
          const overlap =
            sessions[i].start_time < sessions[j].end_time &&
            sessions[i].end_time > sessions[j].start_time;

          if (overlap) {
            return {
              valid: false,
              error: `Session conflict: ${sessions[i].day} ${sessions[i].start_time}-${sessions[i].end_time} overlaps with ${sessions[j].start_time}-${sessions[j].end_time}`,
            };
          }
        }
      }
    }

    // Check location conflicts if location is provided
    if (locationId) {
      for (const session of sessions) {
        const conflicts = await this.dbService.db
          .select({
            group_name: groupSchema.name,
            start_time: groupSessionSchema.start_time,
            end_time: groupSessionSchema.end_time,
          })
          .from(groupSessionSchema)
          .innerJoin(
            groupSchema,
            eq(groupSessionSchema.group_id, groupSchema.id)
          )
          .where(
            and(
              eq(groupSchema.location_id, locationId),
              eq(groupSessionSchema.day, session.day),
              sql`(${session.start_time} < ${groupSessionSchema.end_time} AND ${session.end_time} > ${groupSessionSchema.start_time})`
            )
          )
          .limit(1);

        if (conflicts.length > 0) {
          const conflict = conflicts[0];
          return {
            valid: false,
            error: `Location conflict on ${session.day}: Another group "${conflict.group_name}" is already scheduled on this location $ from ${conflict.start_time} to ${conflict.end_time}`,
          };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Create multiple group sessions (used after group is created)
   */
  async createMultipleGroupSessions(
    groupId: number,
    sessions: CreateGroupSessionDto[]
  ): Promise<APIResponse<GroupSession[] | undefined>> {
    if (!sessions || sessions.length === 0) {
      return APIResponse.error<undefined>({
        message: 'No sessions provided',
        statusCode: 400,
      });
    }

    // Get group location
    const [group] = await this.dbService.db
      .select({ location_id: groupSchema.location_id })
      .from(groupSchema)
      .where(eq(groupSchema.id, groupId))
      .limit(1);

    if (!group) {
      return APIResponse.error<undefined>({
        message: 'Group not found',
        statusCode: 404,
      });
    }

    // Validate all sessions
    const validation = await this.validateSessionsBeforeGroupCreation(
      sessions,
      group.location_id
    );

    if (!validation.valid) {
      return APIResponse.error<undefined>({
        message: validation.error || 'Invalid sessions',
        statusCode: 400,
      });
    }

    // Check for duplicates
    for (const session of sessions) {
      const [duplicate] = await this.dbService.db
        .select({ id: groupSessionSchema.id })
        .from(groupSessionSchema)
        .where(
          and(
            eq(groupSessionSchema.group_id, session.group_id),
            eq(groupSessionSchema.day, session.day),
            eq(groupSessionSchema.start_time, session.start_time),
            eq(groupSessionSchema.end_time, session.end_time)
          )
        )
        .limit(1);

      if (duplicate) {
        return APIResponse.error<undefined>({
          message: `Session already exists for ${session.day} from ${session.start_time} to ${session.end_time}`,
          statusCode: 409,
        });
      }
    }

    // Create all sessions
    const createdSessions = await this.dbService.db
      .insert(groupSessionSchema)
      .values(sessions)
      .returning();

    this.logger.log(
      `Created ${createdSessions.length} sessions for group ${groupId}`
    );

    return APIResponse.success<GroupSession[]>({
      message: `Successfully created ${createdSessions.length} group sessions`,
      data: createdSessions,
      statusCode: 201,
    });
  }

  /**
   * Create a single group session
   */
  async createGroupSession(
    groupSession: CreateGroupSessionDto
  ): Promise<APIResponse<GroupSession | undefined>> {
    // Check if group exists and get location
    const [group] = await this.dbService.db
      .select({
        id: groupSchema.id,
        location_id: groupSchema.location_id,
      })
      .from(groupSchema)
      .where(eq(groupSchema.id, groupSession.group_id))
      .limit(1);

    if (!group) {
      return APIResponse.error<undefined>({
        message: 'Group not found',
        statusCode: 404,
      });
    }

    // Validate the session
    const validation = await this.validateSessionsBeforeGroupCreation(
      [groupSession],
      group.location_id
    );

    if (!validation.valid) {
      return APIResponse.error<undefined>({
        message: validation.error || 'Invalid session',
        statusCode: 400,
      });
    }

    // Check for duplicate
    const [duplicate] = await this.dbService.db
      .select({ id: groupSessionSchema.id })
      .from(groupSessionSchema)
      .where(
        and(
          eq(groupSessionSchema.group_id, groupSession.group_id),
          eq(groupSessionSchema.day, groupSession.day),
          eq(groupSessionSchema.start_time, groupSession.start_time),
          eq(groupSessionSchema.end_time, groupSession.end_time)
        )
      )
      .limit(1);

    if (duplicate) {
      return APIResponse.error<undefined>({
        message: `Session already exists for ${groupSession.day} from ${groupSession.start_time} to ${groupSession.end_time}`,
        statusCode: 409,
      });
    }

    const [newSession] = await this.dbService.db
      .insert(groupSessionSchema)
      .values(groupSession)
      .returning();

    this.logger.log(
      `Session created for group ${groupSession.group_id}: ${groupSession.day} ${groupSession.start_time}-${groupSession.end_time}`
    );

    return APIResponse.success<GroupSession>({
      message: 'Group session created successfully',
      data: newSession,
      statusCode: 201,
    });
  }

  /**
   * Update a group session
   */
  async updateGroupSession(
    sessionId: number,
    updates: Partial<CreateGroupSessionDto>
  ): Promise<APIResponse<GroupSession | undefined>> {
    const [existingSession] = await this.dbService.db
      .select()
      .from(groupSessionSchema)
      .where(eq(groupSessionSchema.id, sessionId))
      .limit(1);

    if (!existingSession) {
      return APIResponse.error<undefined>({
        message: 'Group session not found',
        statusCode: 404,
      });
    }

    // Merge updates with existing values
    const updatedSession: CreateGroupSessionDto = {
      group_id: updates.group_id ?? existingSession.group_id,
      day: (updates.day as GROUP_SESSION_DAY) ?? existingSession.day,
      start_time: updates.start_time ?? existingSession.start_time,
      end_time: updates.end_time ?? existingSession.end_time,
    };

    // Get group location
    const [group] = await this.dbService.db
      .select({ location_id: groupSchema.location_id })
      .from(groupSchema)
      .where(eq(groupSchema.id, updatedSession.group_id))
      .limit(1);

    if (!group) {
      return APIResponse.error<undefined>({
        message: 'Group not found',
        statusCode: 404,
      });
    }

    // Validate the updated session
    const validation = await this.validateSessionsBeforeGroupCreation(
      [updatedSession],
      group.location_id
    );

    if (!validation.valid) {
      return APIResponse.error<undefined>({
        message: validation.error || 'Invalid session update',
        statusCode: 400,
      });
    }

    // Check for conflicts excluding current session
    if (group.location_id) {
      const [conflict] = await this.dbService.db
        .select({
          group_name: groupSchema.name,
          start_time: groupSessionSchema.start_time,
          end_time: groupSessionSchema.end_time,
        })
        .from(groupSessionSchema)
        .innerJoin(groupSchema, eq(groupSessionSchema.group_id, groupSchema.id))
        .where(
          and(
            eq(groupSchema.location_id, group.location_id),
            eq(groupSessionSchema.day, updatedSession.day),
            ne(groupSessionSchema.id, sessionId),
            sql`(${updatedSession.start_time} < ${groupSessionSchema.end_time} AND ${updatedSession.end_time} > ${groupSessionSchema.start_time})`
          )
        )
        .limit(1);

      if (conflict) {
        return APIResponse.error<undefined>({
          message: `Time conflict with group "${conflict.group_name}" from ${conflict.start_time} to ${conflict.end_time}`,
          statusCode: 409,
        });
      }
    }

    const [updated] = await this.dbService.db
      .update(groupSessionSchema)
      .set({
        ...updates,
        updated_at: new Date(),
      })
      .where(eq(groupSessionSchema.id, sessionId))
      .returning();

    this.logger.log(`Session ${sessionId} updated successfully`);

    return APIResponse.success<GroupSession>({
      message: 'Group session updated successfully',
      data: updated,
      statusCode: 200,
    });
  }

  /**
   * Find all group sessions with pagination
   */
  async findAllGroupSessions(
    params: QueryGroupSessionDto
  ): Promise<APIResponse<IGroupSessionResponse[] | undefined>> {
    const offset = getPageOffset(
      params.page ?? '1',
      params.limit ?? APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString()
    );

    const whereConditions: SQL[] = [];
    if (params.group_id && !isNaN(params.group_id)) {
      whereConditions.push(eq(groupSessionSchema.group_id, params.group_id));
    }

    const sessions = await this.dbService.db
      .select({
        id: groupSessionSchema.id,
        group_id: groupSessionSchema.group_id,
        group_name: groupSchema.name,
        day: groupSessionSchema.day,
        start_time: groupSessionSchema.start_time,
        end_time: groupSessionSchema.end_time,
        location_id: groupSchema.location_id,
        location_name: locationSchema.name,
      })
      .from(groupSessionSchema)
      .leftJoin(groupSchema, eq(groupSessionSchema.group_id, groupSchema.id))
      .leftJoin(locationSchema, eq(groupSchema.location_id, locationSchema.id))
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .limit(Number(params.limit))
      .offset(offset);

    const [{ count }] = await this.dbService.db
      .select({ count: sql<number>`count(*)` })
      .from(groupSessionSchema)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);

    return APIResponse.success<IGroupSessionResponse[]>({
      message: 'Group sessions retrieved successfully',
      data: sessions,
      pagination: {
        count,
        page: Number(params.page),
        limit: Number(params.limit),
        totalPages: Math.ceil(count / Number(params.limit)),
      },
      statusCode: 200,
    });
  }

  /**
   * Find a single group session
   */
  async findOne(
    id: number
  ): Promise<APIResponse<IGroupSessionResponse | undefined>> {
    const [session] = await this.dbService.db
      .select({
        id: groupSessionSchema.id,
        group_id: groupSessionSchema.group_id,
        group_name: groupSchema.name,
        day: groupSessionSchema.day,
        start_time: groupSessionSchema.start_time,
        end_time: groupSessionSchema.end_time,
        location_id: groupSchema.location_id,
        location_name: locationSchema.name,
      })
      .from(groupSessionSchema)
      .leftJoin(groupSchema, eq(groupSessionSchema.group_id, groupSchema.id))
      .leftJoin(locationSchema, eq(groupSchema.location_id, locationSchema.id))
      .where(eq(groupSessionSchema.id, id))
      .limit(1);

    if (!session) {
      return APIResponse.error<undefined>({
        message: 'Group session not found',
        statusCode: 404,
      });
    }

    return APIResponse.success<IGroupSessionResponse>({
      message: 'Group session retrieved successfully',
      data: session,
      statusCode: 200,
    });
  }

  /**
   * Delete a group session
   */
  async deleteGroupSession(
    id: number
  ): Promise<APIResponse<GroupSession | undefined>> {
    const [existingSession] = await this.dbService.db
      .select()
      .from(groupSessionSchema)
      .where(eq(groupSessionSchema.id, id))
      .limit(1);

    if (!existingSession) {
      return APIResponse.error<undefined>({
        message: 'Group session not found',
        statusCode: 404,
      });
    }

    const [deleted] = await this.dbService.db
      .delete(groupSessionSchema)
      .where(eq(groupSessionSchema.id, id))
      .returning();

    this.logger.log(`Session ${id} deleted successfully`);

    return APIResponse.success<GroupSession>({
      message: 'Group session deleted successfully',
      data: deleted,
      statusCode: 200,
    });
  }
}
