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
} from '../db/schemas';
import { APP_CONSTANTS } from '../utils/constants';
import { getPageOffset } from '../utils/pagination';
import { FileStorageService } from '../services/file-storage.service';
import { GroupSessionService } from './groupSession.service';
import { CreateGroupSessionDto } from './dto/create-groupsession.dto';

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
    photo_url?: Express.Multer.File,
    sessions?: CreateGroupSessionDto[]
  ) {
    try {
      // Validate that min_age is less than max_age
      if (createGroupDto.min_age >= createGroupDto.max_age) {
        throw new ConflictException(
          'Minimum age must be less than maximum age'
        );
      }

      // Check if group with this name already exists at the same location
      if (createGroupDto.location_id) {
        const existingGroup = await this.dbService.db
          .select()
          .from(groupSchema)
          .where(
            and(
              eq(groupSchema.name, createGroupDto.name),
              eq(groupSchema.location_id, createGroupDto.location_id)
            )
          )
          .limit(1);

        if (existingGroup.length > 0) {
          throw new ConflictException(
            'Group with this name already exists at this location'
          );
        }
      }

      const newGroup = await this.dbService.db
        .insert(groupSchema)
        .values({
          ...createGroupDto,
        })
        .returning();

      if (sessions && sessions.length > 0) {
        for (const session of sessions) {
          await this.groupSessionService.createGroupSession({
            ...session,
            group_id: newGroup[0].id,
          });
        }
      }

      if (photo_url) {
        await this.updatePhotoUrl(newGroup[0].id, photo_url);
      }

      this.logger.log(`Group created successfully with ID: ${newGroup[0].id}`);

      return {
        message: 'Group created successfully',
        data: newGroup[0],
      };
    } catch (error) {
      this.logger.error(`Failed to create group: ${(error as Error).message}`);
      throw error;
    }
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
  async findAll(params: { page: string; limit: string }) {
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

    // Early return if no groups found
    if (groups.length === 0) {
      const [{ count }] = await this.dbService.db
        .select({ count: sql<number>`COUNT(*)` })
        .from(groupSchema);

      return {
        message: 'Groups retrieved successfully',
        data: [],
        page,
        limit,
        count,
      };
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

    // Attach sessions to their respective groups
    const groupsWithSessions = groups.map((group) => ({
      ...group,
      sessions: sessionsMap.get(group.id) || [],
    }));

    // Get total count
    const [{ count }] = await this.dbService.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(groupSchema);

    return {
      message: 'Groups retrieved successfully',
      data: groupsWithSessions,
      page,
      limit,
      count,
    };
  }
  /**
   * Optimized findOne method
   */
  async findOne(id: number) {
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
      throw new NotFoundException('Group not found');
    }

    return {
      message: 'Group retrieved successfully',
      data: group[0],
    };
  }

  async update(
    id: number,
    updateGroupDto: UpdateGroupDto,
    photo_url?: Express.Multer.File
  ) {
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

      return {
        message: 'Group updated successfully',
        data: updatedGroup[0],
      };
    } catch (error) {
      this.logger.error(`Failed to update group: ${(error as Error).message}`);
      throw error;
    }
  }

  async remove(id: number) {
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

      return {
        message: 'Group deleted successfully',
        data: deletedGroup[0],
      };
    } catch (error) {
      this.logger.error(`Failed to delete group: ${(error as Error).message}`);
      throw error;
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
