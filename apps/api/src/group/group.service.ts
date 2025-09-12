import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { DatabaseService } from '../db/drizzle.service';
import { eq, sql, and, ne, desc, inArray } from 'drizzle-orm';
import {
  groupSchema,
  locationSchema,
  coachSchema,
  userSchema,
  groupSessionSchema,
  Group,
} from '../db/schemas';
import { APP_CONSTANTS } from '../utils/constants';
import { getPageOffset } from '../utils/pagination';
import { FileStorageService } from '../services/file-storage.service';
import { GroupSessionService } from './groupSession.service';
import { APIResponse } from '../utils/response';
import { IGroupResponse } from './group.types';

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly fileStorageService: FileStorageService,
    private readonly groupSessionService: GroupSessionService
  ) {}

  async create(
    createGroupDto: CreateGroupDto,
    photo_url?: Express.Multer.File
  ): Promise<APIResponse<Group | undefined>> {
    // Validate age range
    if (createGroupDto.min_age >= createGroupDto.max_age) {
      return APIResponse.error<undefined>({
        message: 'Minimum age must be less than maximum age',
        statusCode: 400,
      });
    }

    // Check for duplicate group name at the same location
    if (createGroupDto.location_id) {
      const [existingGroup] = await this.dbService.db
        .select({ id: groupSchema.id })
        .from(groupSchema)
        .where(
          and(
            eq(groupSchema.name, createGroupDto.name),
            eq(groupSchema.location_id, createGroupDto.location_id)
          )
        )
        .limit(1);

      if (existingGroup) {
        return APIResponse.error<undefined>({
          message: 'Group with this name already exists at this location',
          statusCode: 409,
        });
      }
    }

    // Validate sessions BEFORE creating the group
    if (createGroupDto.sessions && createGroupDto.sessions.length > 0) {
      const validationResult =
        await this.groupSessionService.validateSessionsBeforeGroupCreation(
          createGroupDto.sessions,
          createGroupDto.location_id || null
        );

      if (!validationResult.valid) {
        return APIResponse.error<undefined>({
          message: `Cannot create group: ${validationResult.error}`,
          statusCode: 400,
        });
      }
    }

    // Create the group
    const [newGroup] = await this.dbService.db
      .insert(groupSchema)
      .values({
        name: createGroupDto.name,
        description: createGroupDto.description,
        min_age: createGroupDto.min_age,
        max_age: createGroupDto.max_age,
        skill_level: createGroupDto.skill_level,
        max_group_size: createGroupDto.max_group_size,
        location_id: createGroupDto.location_id,
        coach_id: createGroupDto.coach_id,
      })
      .returning();

    if (createGroupDto.sessions && createGroupDto.sessions.length > 0) {
      const result = await this.groupSessionService.createMultipleGroupSessions(
        newGroup.id,
        createGroupDto.sessions.map((session) => ({
          ...session,
          group_id: newGroup.id,
        }))
      );

      // If session creation fails, we need to rollback by deleting the group
      if (result.statusCode !== 201) {
        await this.dbService.db
          .delete(groupSchema)
          .where(eq(groupSchema.id, newGroup.id));

        return APIResponse.error<undefined>({
          message: `Group creation failed: ${result.message}`,
          statusCode: 400,
        });
      }
    }

    // Handle photo upload
    if (photo_url) {
      await this.updatePhotoUrl(newGroup.id, photo_url);
    }

    this.logger.log(`Group created successfully with ID: ${newGroup.id}`);

    return APIResponse.success<Group>({
      message: 'Group created successfully',
      data: newGroup,
      statusCode: 201,
    });
  }

  /**
   * Optimized count method - uses simple COUNT without unnecessary joins
   */
  async count() {
    const [{ count }] = await this.dbService.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(groupSchema);
    return count;
  }

  /**
   * Optimized findAll method with better query structure
   */
  async findAll(params: {
    page: string;
    limit: string;
  }): Promise<APIResponse<IGroupResponse[] | undefined>> {
    const {
      page = '1',
      limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString(),
    } = params;

    const offset = getPageOffset(page, limit);

    // First query: Get groups with basic relations
    const groups = await this.dbService.db
      .select({
        id: groupSchema.id,
        name: groupSchema.name,
        description: groupSchema.description,
        min_age: groupSchema.min_age,
        max_age: groupSchema.max_age,
        skill_level: groupSchema.skill_level,
        max_group_size: groupSchema.max_group_size,
        created_at: groupSchema.created_at,
        updated_at: groupSchema.updated_at,
        photo_url: groupSchema.photo_url,
        location: {
          id: locationSchema.id,
          name: locationSchema.name,
          address1: locationSchema.address1,
          city: locationSchema.city,
          state: locationSchema.state,
        },
        coach: {
          id: coachSchema.id,
          user_id: coachSchema.user_id,
          first_name: userSchema.first_name,
          last_name: userSchema.last_name,
          email: userSchema.email,
          photo_url: userSchema.photo_url,
        },
      })
      .from(groupSchema)
      .leftJoin(locationSchema, eq(groupSchema.location_id, locationSchema.id))
      .leftJoin(coachSchema, eq(groupSchema.coach_id, coachSchema.id))
      .leftJoin(userSchema, eq(coachSchema.user_id, userSchema.id))
      .orderBy(desc(groupSchema.created_at))
      .offset(offset)
      .limit(Number(limit));

    if (groups.length === 0) {
      return APIResponse.error<undefined>({
        message: 'No groups found',
        statusCode: 404,
      });
    }

    // Extract group IDs for sessions query
    const groupIds = groups.map((group) => group.id);

    // Second query: Get all sessions for these groups in a single query
    const sessions = await this.dbService.db
      .select({
        id: groupSessionSchema.id,
        group_id: groupSessionSchema.group_id,
        day: groupSessionSchema.day,
        start_time: groupSessionSchema.start_time,
        end_time: groupSessionSchema.end_time,
        created_at: groupSessionSchema.created_at,
        updated_at: groupSessionSchema.updated_at,
      })
      .from(groupSessionSchema)
      .where(inArray(groupSessionSchema.group_id, groupIds))
      .orderBy(
        groupSessionSchema.group_id,
        groupSessionSchema.day,
        groupSessionSchema.start_time
      );

    // Group sessions by group_id for O(1) lookup
    const sessionsMap = new Map<number, typeof sessions>();
    sessions.forEach((session) => {
      if (!sessionsMap.has(session.group_id)) {
        sessionsMap.set(session.group_id, []);
      }
      sessionsMap.get(session.group_id)!.push(session);
    });

    // Convert photo URLs to absolute URLs and attach sessions to their respective groups
    const groupsWithSessions = groups.map((group) => ({
      ...group,
      photo_url: group.photo_url
        ? this.fileStorageService.getAbsoluteUrl(group.photo_url)
        : null,
      location: group.location
        ? {
            ...group.location,
            name: group.location.name || '',
          }
        : null,
      coach: group.coach
        ? {
            ...group.coach,
            first_name: group.coach.first_name || '',
            last_name: group.coach.last_name,
            email: group.coach.email || '',
            photo_url: group.coach.photo_url
              ? this.fileStorageService.getAbsoluteUrl(group.coach.photo_url)
              : null,
          }
        : null,
      sessions: sessionsMap.get(group.id) || [],
    }));

    // Get total count
    const [{ count }] = await this.dbService.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(groupSchema);

    return APIResponse.success<IGroupResponse[]>({
      message: 'Groups retrieved successfully',
      data: groupsWithSessions,
      pagination: {
        count: count,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(count / Number(limit)),
      },
      statusCode: 200,
    });
  }

  /**
   * Optimized findOne method
   */
  async findOne(id: number): Promise<APIResponse<IGroupResponse | undefined>> {
    const group = await this.dbService.db
      .select({
        id: groupSchema.id,
        name: groupSchema.name,
        description: groupSchema.description,
        min_age: groupSchema.min_age,
        max_age: groupSchema.max_age,
        skill_level: groupSchema.skill_level,
        max_group_size: groupSchema.max_group_size,
        created_at: groupSchema.created_at,
        updated_at: groupSchema.updated_at,
        photo_url: groupSchema.photo_url,
        location: {
          id: locationSchema.id,
          name: locationSchema.name,
          address1: locationSchema.address1,
          city: locationSchema.city,
          state: locationSchema.state,
        },
        coach: {
          id: coachSchema.id,
          user_id: coachSchema.user_id,
          first_name: userSchema.first_name,
          last_name: userSchema.last_name,
          email: userSchema.email,
          photo_url: userSchema.photo_url,
        },
      })
      .from(groupSchema)
      .leftJoin(locationSchema, eq(groupSchema.location_id, locationSchema.id))
      .leftJoin(coachSchema, eq(groupSchema.coach_id, coachSchema.id))
      .leftJoin(userSchema, eq(coachSchema.user_id, userSchema.id))
      .where(eq(groupSchema.id, id))
      .limit(1);

    if (group.length === 0) {
      return APIResponse.error<undefined>({
        message: 'Group not found',
        statusCode: 404,
      });
    }

    // Get sessions for this group
    const sessions = await this.dbService.db
      .select({
        id: groupSessionSchema.id,
        group_id: groupSessionSchema.group_id,
        day: groupSessionSchema.day,
        start_time: groupSessionSchema.start_time,
        end_time: groupSessionSchema.end_time,
        created_at: groupSessionSchema.created_at,
        updated_at: groupSessionSchema.updated_at,
      })
      .from(groupSessionSchema)
      .where(eq(groupSessionSchema.group_id, id))
      .orderBy(groupSessionSchema.day, groupSessionSchema.start_time);

    // Convert photo URLs to absolute URLs and prepare the response
    const groupWithDetails: IGroupResponse = {
      ...group[0],
      photo_url: group[0].photo_url
        ? this.fileStorageService.getAbsoluteUrl(group[0].photo_url)
        : null,
      location: group[0].location
        ? {
            ...group[0].location,
            name: group[0].location.name || '',
          }
        : null,
      coach: group[0].coach
        ? {
            ...group[0].coach,
            first_name: group[0].coach.first_name || '',
            last_name: group[0].coach.last_name,
            email: group[0].coach.email || '',
            photo_url: group[0].coach.photo_url
              ? this.fileStorageService.getAbsoluteUrl(group[0].coach.photo_url)
              : null,
          }
        : null,
      sessions: sessions,
    };

    return APIResponse.success<IGroupResponse>({
      message: 'Group retrieved successfully',
      data: groupWithDetails,
      statusCode: 200,
    });
  }

  async update(
    id: number,
    updateGroupDto: UpdateGroupDto,
    photo_url?: Express.Multer.File
  ): Promise<APIResponse<Group | undefined>> {
    try {
      // Check if group exists
      const existingGroup = await this.dbService.db
        .select()
        .from(groupSchema)
        .where(eq(groupSchema.id, id))
        .limit(1);

      if (existingGroup.length === 0) {
        throw new NotFoundException('Group not found');
      }

      // Validate that min_age is less than max_age if both are being updated
      if (
        updateGroupDto.min_age !== undefined &&
        updateGroupDto.max_age !== undefined
      ) {
        if (updateGroupDto.min_age >= updateGroupDto.max_age) {
          throw new ConflictException(
            'Minimum age must be less than maximum age'
          );
        }
      } else if (updateGroupDto.min_age !== undefined) {
        if (updateGroupDto.min_age >= existingGroup[0].max_age) {
          throw new ConflictException(
            'Minimum age must be less than maximum age'
          );
        }
      } else if (updateGroupDto.max_age !== undefined) {
        if (existingGroup[0].min_age >= updateGroupDto.max_age) {
          throw new ConflictException(
            'Minimum age must be less than maximum age'
          );
        }
      }

      // Check for name conflicts at the same location
      if (updateGroupDto.name && updateGroupDto.location_id) {
        const nameConflict = await this.dbService.db
          .select()
          .from(groupSchema)
          .where(
            and(
              eq(groupSchema.name, updateGroupDto.name),
              eq(groupSchema.location_id, updateGroupDto.location_id),
              ne(groupSchema.id, id)
            )
          )
          .limit(1);

        if (nameConflict.length > 0) {
          throw new ConflictException(
            'Group with this name already exists at this location'
          );
        }
      }

      if (photo_url && existingGroup[0].photo_url) {
        await this.fileStorageService.deleteFile(existingGroup[0].photo_url);
        const uploadResult = await this.fileStorageService.uploadFile(
          photo_url,
          'groups_profiles',
          id
        );
        updateGroupDto.photo_url = uploadResult.relativePath;
      }

      const updatedGroup = await this.dbService.db
        .update(groupSchema)
        .set({
          ...updateGroupDto,
          updated_at: new Date(),
        })
        .where(eq(groupSchema.id, id))
        .returning();

      this.logger.log(`Group updated successfully with ID: ${id}`);

      return APIResponse.success<Group>({
        message: 'Group updated successfully',
        data: updatedGroup[0],
        statusCode: 200,
      });
    } catch (error) {
      this.logger.error(`Failed to update group: ${(error as Error).message}`);
      return APIResponse.error<undefined>({
        message: 'Failed to update group',
        statusCode: 500,
      });
    }
  }

  async remove(id: number): Promise<APIResponse<Group | undefined>> {
    try {
      // Check if group exists
      const existingGroup = await this.dbService.db
        .select()
        .from(groupSchema)
        .where(eq(groupSchema.id, id))
        .limit(1);

      if (existingGroup.length === 0) {
        throw new NotFoundException('Group not found');
      }

      if (existingGroup[0].photo_url) {
        await this.fileStorageService.deleteFile(existingGroup[0].photo_url);
      }

      // Delete group record
      const deletedGroup = await this.dbService.db
        .delete(groupSchema)
        .where(eq(groupSchema.id, id))
        .returning();

      this.logger.log(`Group deleted successfully with ID: ${id}`);

      return APIResponse.success<Group>({
        message: 'Group deleted successfully',
        data: deletedGroup[0],
        statusCode: 200,
      });
    } catch (error) {
      this.logger.error(`Failed to delete group: ${(error as Error).message}`);
      return APIResponse.error<undefined>({
        message: 'Failed to delete group',
        statusCode: 500,
      });
    }
  }

  async updatePhotoUrl(id: number, photo_url: Express.Multer.File) {
    const uploadResult = await this.fileStorageService.uploadFile(
      photo_url,
      'groups_profiles',
      id
    );

    const updatedGroup = await this.dbService.db
      .update(groupSchema)
      .set({
        photo_url: uploadResult.relativePath,
        updated_at: new Date(),
      })
      .where(eq(groupSchema.id, id))
      .returning();

    return updatedGroup[0];
  }

  async deletePhotoUrl(id: number) {
    const deletedGroup = await this.dbService.db
      .update(groupSchema)
      .set({ photo_url: null })
      .where(eq(groupSchema.id, id))
      .returning();

    return deletedGroup[0];
  }
}
