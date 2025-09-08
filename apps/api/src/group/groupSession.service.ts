import {
  ConflictException,
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { groupSessionSchema } from 'src/db/schemas/groupSessionSchema';
import { and, eq, ne, SQL, sql } from 'drizzle-orm';
import { DatabaseService } from '../db/drizzle.service';
import { CreateGroupSessionDto } from './dto/create-groupsession.dto';
import { APP_CONSTANTS, GROUP_SESSION_DAY } from 'src/utils/constants';
import { groupSchema } from 'src/db/schemas/groupSchema';
import { locationSchema } from 'src/db/schemas/locationSchema';
import { getPageOffset } from 'src/utils';
import { QueryGroupSessionDto } from './dto/query-groupsession.dto';

@Injectable()
export class GroupSessionService {
  private readonly logger = new Logger(GroupSessionService.name);
  constructor(private readonly dbService: DatabaseService) {}

  async createGroupSession(groupSession: CreateGroupSessionDto) {
    // Validate basic input
    this.timeValidationCheck(groupSession);
    this.dayValidationCheck(groupSession);

    // Check if the group exists and get its location
    const groupInfo = await this.getGroupWithLocation(groupSession.group_id);
    if (!groupInfo) {
      throw new NotFoundException('Group not found');
    }

    // Check for conflicts at the same location
    await this.checkLocationConflicts(groupSession, groupInfo.location_id);

    // Check for exact duplicate session for the same group
    await this.checkDuplicateGroupSession(groupSession);

    // Create the new group session
    const newGroupSession = await this.dbService.db
      .insert(groupSessionSchema)
      .values(groupSession)
      .returning();

    return {
      message: 'Group session created successfully',
      data: newGroupSession[0],
    };
  }

  /**
   * Validate that start time is before end time
   */
  private timeValidationCheck(groupSession: CreateGroupSessionDto) {
    const isValidTime = groupSession.start_time < groupSession.end_time;
    if (!isValidTime) {
      throw new BadRequestException('Start time must be before end time');
    }
  }

  /**
   * Validate that the day is valid
   */
  private dayValidationCheck(groupSession: CreateGroupSessionDto) {
    const isValidDay = Object.values(GROUP_SESSION_DAY).includes(
      groupSession.day
    );
    if (!isValidDay) {
      throw new BadRequestException(
        `Invalid day. Must be one of: ${Object.values(GROUP_SESSION_DAY).join(', ')}`
      );
    }
  }

  /**
   * Get group information with its location
   */
  private async getGroupWithLocation(groupId: number) {
    const result = await this.dbService.db
      .select({
        group_id: groupSchema.id,
        group_name: groupSchema.name,
        location_id: groupSchema.location_id,
        location_name: locationSchema.name,
        location_address: locationSchema.address1,
      })
      .from(groupSchema)
      .leftJoin(locationSchema, eq(groupSchema.location_id, locationSchema.id))
      .where(eq(groupSchema.id, groupId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Check for time conflicts at the same location
   * This prevents overlapping sessions at the same location
   */
  private async checkLocationConflicts(
    newSession: CreateGroupSessionDto,
    locationId: number | null
  ) {
    if (!locationId) {
      // If group has no location, we can't check location conflicts
      return;
    }

    // Find all sessions at the same location on the same day
    const conflictingSessions = await this.dbService.db
      .select({
        session_id: groupSessionSchema.id,
        group_id: groupSessionSchema.group_id,
        group_name: groupSchema.name,
        day: groupSessionSchema.day,
        start_time: groupSessionSchema.start_time,
        end_time: groupSessionSchema.end_time,
        location_name: locationSchema.name,
        location_address: locationSchema.address1,
        location_city: locationSchema.city,
        location_state: locationSchema.state,
        location_country: locationSchema.country,
      })
      .from(groupSessionSchema)
      .innerJoin(groupSchema, eq(groupSessionSchema.group_id, groupSchema.id))
      .innerJoin(locationSchema, eq(groupSchema.location_id, locationSchema.id))
      .where(
        and(
          eq(groupSchema.location_id, locationId),
          eq(groupSessionSchema.day, newSession.day),
          // Check for time overlap: new session overlaps if it starts before existing ends AND ends after existing starts
          sql`(${newSession.start_time} < ${groupSessionSchema.end_time} AND ${newSession.end_time} > ${groupSessionSchema.start_time})`
        )
      );

    if (conflictingSessions.length > 0) {
      const conflict = conflictingSessions[0];
      const locationStr = [
        conflict.location_address,
        conflict.location_city,
        conflict.location_state,
        conflict.location_country,
      ]
        .filter(Boolean)
        .join(', ');

      throw new ConflictException(
        `Time conflict at location "${conflict.location_name || 'Unnamed Location'}" (${locationStr}). ` +
          `Another session "${conflict.group_name}" is scheduled on ${conflict.day} from ${conflict.start_time} to ${conflict.end_time}. ` +
          `Your session (${newSession.start_time} - ${newSession.end_time}) overlaps with this existing session.`
      );
    }
  }

  /**
   * Check for exact duplicate session for the same group
   */
  private async checkDuplicateGroupSession(
    groupSession: CreateGroupSessionDto
  ) {
    const existingGroupSession = await this.dbService.db
      .select()
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

    if (existingGroupSession.length > 0) {
      throw new ConflictException(
        `This exact session already exists for this group on ${groupSession.day} from ${groupSession.start_time} to ${groupSession.end_time}`
      );
    }
  }

  /**
   * Create multiple group sessions with batch validation
   */
  async createMultipleGroupSessions(
    groupId: number,
    sessions: CreateGroupSessionDto[]
  ) {
    if (!sessions || sessions.length === 0) {
      throw new BadRequestException('No sessions provided');
    }

    // Validate all sessions first
    for (const session of sessions) {
      if (session.group_id !== groupId) {
        throw new BadRequestException(
          'All sessions must belong to the same group'
        );
      }
      this.timeValidationCheck(session);
      this.dayValidationCheck(session);
    }

    // Get group information
    const groupInfo = await this.getGroupWithLocation(groupId);
    if (!groupInfo) {
      throw new NotFoundException('Group not found');
    }

    // Check for conflicts for each session
    for (const session of sessions) {
      await this.checkLocationConflicts(session, groupInfo.location_id);
      await this.checkDuplicateGroupSession(session);
    }

    // Check for conflicts between the new sessions themselves
    this.checkInternalConflicts(sessions);

    // Create all sessions
    const createdSessions = await this.dbService.db
      .insert(groupSessionSchema)
      .values(sessions)
      .returning();

    return {
      message: `Successfully created ${createdSessions.length} group sessions`,
      data: createdSessions,
    };
  }

  /**
   * Check for conflicts between the sessions being created
   */
  private checkInternalConflicts(sessions: CreateGroupSessionDto[]) {
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        const session1 = sessions[i];
        const session2 = sessions[j];

        // Check if they're on the same day and have overlapping times
        if (session1.day === session2.day) {
          const overlap =
            session1.start_time < session2.end_time &&
            session1.end_time > session2.start_time;

          if (overlap) {
            throw new ConflictException(
              `Conflict between sessions: ${session1.day} ${session1.start_time}-${session1.end_time} ` +
                `overlaps with ${session2.day} ${session2.start_time}-${session2.end_time}`
            );
          }
        }
      }
    }
  }

  /**
   * Update a group session with conflict checking
   */
  async updateGroupSession(
    sessionId: number,
    updates: Partial<CreateGroupSessionDto>
  ) {
    // Get existing session
    const existingSession = await this.dbService.db
      .select()
      .from(groupSessionSchema)
      .where(eq(groupSessionSchema.id, sessionId))
      .limit(1);

    if (existingSession.length === 0) {
      throw new NotFoundException('Group session not found');
    }

    const current = existingSession[0];

    // Merge current values with updates
    const updatedSession: CreateGroupSessionDto = {
      group_id: updates.group_id ?? current.group_id,
      day: (updates.day as GROUP_SESSION_DAY) ?? current.day,
      start_time: updates.start_time ?? current.start_time,
      end_time: updates.end_time ?? current.end_time,
    };

    // Validate the updated session
    this.timeValidationCheck(updatedSession);
    this.dayValidationCheck(updatedSession);

    // Get group information
    const groupInfo = await this.getGroupWithLocation(updatedSession.group_id);
    if (!groupInfo) {
      throw new NotFoundException('Group not found');
    }

    // Check for conflicts, excluding the current session
    await this.checkLocationConflictsForUpdate(
      updatedSession,
      groupInfo.location_id,
      sessionId
    );

    // Update the session
    const updated = await this.dbService.db
      .update(groupSessionSchema)
      .set({
        ...updates,
        updated_at: new Date(),
      })
      .where(eq(groupSessionSchema.id, sessionId))
      .returning();

    return {
      message: 'Group session updated successfully',
      data: updated[0],
    };
  }

  /**
   * Check location conflicts for updates (excluding current session)
   */
  private async checkLocationConflictsForUpdate(
    updatedSession: CreateGroupSessionDto,
    locationId: number | null,
    excludeSessionId: number
  ) {
    if (!locationId) return;

    const conflictingSessions = await this.dbService.db
      .select({
        session_id: groupSessionSchema.id,
        group_name: groupSchema.name,
        start_time: groupSessionSchema.start_time,
        end_time: groupSessionSchema.end_time,
        location_name: locationSchema.name,
      })
      .from(groupSessionSchema)
      .innerJoin(groupSchema, eq(groupSessionSchema.group_id, groupSchema.id))
      .innerJoin(locationSchema, eq(groupSchema.location_id, locationSchema.id))
      .where(
        and(
          eq(groupSchema.location_id, locationId),
          eq(groupSessionSchema.day, updatedSession.day),
          ne(groupSessionSchema.id, excludeSessionId), // Exclude current session
          sql`(${updatedSession.start_time} < ${groupSessionSchema.end_time} AND ${updatedSession.end_time} > ${groupSessionSchema.start_time})`
        )
      );

    if (conflictingSessions.length > 0) {
      const conflict = conflictingSessions[0];
      throw new ConflictException(
        `Time conflict with existing session "${conflict.group_name}" at "${conflict.location_name}" ` +
          `from ${conflict.start_time} to ${conflict.end_time}`
      );
    }
  }

  async findAllGroupSessions(params: QueryGroupSessionDto) {
    try {
      const offset = getPageOffset(
        params.page ?? '1',
        params.limit ?? APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString()
      );

      // Build the where condition dynamically
      const whereConditions: SQL[] = [];

      // Only add group_id filter if it's provided and valid
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
        .leftJoin(
          locationSchema,
          eq(groupSchema.location_id, locationSchema.id)
        )
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .limit(Number(params.limit))
        .offset(offset);

      // Get total count with the same conditions
      const totalResult = await this.dbService.db
        .select({ count: sql<number>`count(*)` })
        .from(groupSessionSchema)
        .leftJoin(groupSchema, eq(groupSessionSchema.group_id, groupSchema.id))
        .leftJoin(
          locationSchema,
          eq(groupSchema.location_id, locationSchema.id)
        )
        .where(
          whereConditions.length > 0 ? and(...whereConditions) : undefined
        );

      const total = totalResult[0]?.count || 0;

      const result = {
        data: sessions,
        total,
        page: params.page,
        limit: params.limit,
      };

      return result;
    } catch (error) {
      console.error('Error in findAllGroupSessions:', error);
      throw error;
    }
  }

  async findOne(id: number) {
    const session = await this.dbService.db
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
      .innerJoin(groupSchema, eq(groupSessionSchema.group_id, groupSchema.id))
      .innerJoin(locationSchema, eq(groupSchema.location_id, locationSchema.id))
      .where(eq(groupSessionSchema.id, id))
      .limit(1);

    if (session.length === 0) {
      throw new NotFoundException('Group session not found');
    }

    return session[0];
  }
}
