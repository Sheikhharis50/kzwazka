import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { DatabaseService } from '../db/drizzle.service';
import { eq, sql, and, ne } from 'drizzle-orm';
import { groupSchema, locationSchema, coachSchema } from '../db/schemas';
import { APP_CONSTANTS } from '../utils/constants';
import { getPageOffset } from '../utils/pagination';

@Injectable()
export class GroupService {
  private readonly logger = new Logger(GroupService.name);

  constructor(private readonly dbService: DatabaseService) {}

  async create(createGroupDto: CreateGroupDto) {
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

  async count() {
    const [{ count }] = await this.dbService.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(groupSchema)
      .limit(1);
    return count;
  }

  async findAll(params: { page: string; limit: string }) {
    const {
      page = '1',
      limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString(),
    } = params;

    const offset = getPageOffset(page, limit);

    const [count, results] = await Promise.all([
      this.count(),
      this.dbService.db
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
          location: {
            id: locationSchema.id,
            name: locationSchema.name,
            address1: locationSchema.address1,
            city: locationSchema.city,
            state: locationSchema.state,
          },
          coach: {
            id: coachSchema.id,
            name: coachSchema.name,
            email: coachSchema.email,
            phone: coachSchema.phone,
          },
        })
        .from(groupSchema)
        .leftJoin(
          locationSchema,
          eq(groupSchema.location_id, locationSchema.id)
        )
        .leftJoin(coachSchema, eq(groupSchema.coach_id, coachSchema.id))
        .offset(offset)
        .limit(Number(limit)),
    ]);

    return {
      message: 'Groups retrieved successfully',
      data: results,
      page,
      limit,
      count,
    };
  }

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
        location: {
          id: locationSchema.id,
          name: locationSchema.name,
          address1: locationSchema.address1,
          city: locationSchema.city,
          state: locationSchema.state,
        },
        coach: {
          id: coachSchema.id,
          name: coachSchema.name,
          email: coachSchema.email,
          phone: coachSchema.phone,
        },
      })
      .from(groupSchema)
      .leftJoin(locationSchema, eq(groupSchema.location_id, locationSchema.id))
      .leftJoin(coachSchema, eq(groupSchema.coach_id, coachSchema.id))
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

  async update(id: number, updateGroupDto: UpdateGroupDto) {
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
}
