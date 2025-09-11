import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../db/drizzle.service';
import { eq, and, desc, sql, inArray, SQL } from 'drizzle-orm';
import {
  childrenGroupSchema,
  childrenSchema,
  groupSchema,
  userSchema,
} from '../db/schemas';
import { CreateChildrenGroupDto } from './dto/create-children-group.dto';
import { UpdateChildrenGroupDto } from './dto/update-children-group.dto';
import { QueryChildrenGroupDto } from './dto/query-children-group.dto';
import { GroupService } from '../group/group.service';
import { APP_CONSTANTS, getPageOffset } from '../utils';
import { APIResponse } from '../utils/response';

interface ChildrenGroupUpdateValues {
  children_id?: number;
  group_id?: number;
  status?: boolean;
  updated_at: Date;
}

export interface ChildrenGroup {
  id: number;
  children_id: number;
  group_id: number;
  status: boolean;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class ChildrenGroupService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly groupService: GroupService
  ) {}

  async create(
    createChildrenGroupDto: CreateChildrenGroupDto
  ): Promise<APIResponse<ChildrenGroup[] | undefined>> {
    const groupId = Number(createChildrenGroupDto.group_id);
    const childrenIds: number[] =
      createChildrenGroupDto.children_ids?.map((id: string | number) =>
        Number(id)
      ) || [];

    // Verify that the group exists
    const group = await this.groupService.findOne(groupId);
    if (!group) {
      return APIResponse.error<undefined>({
        message: 'Group not found',
        statusCode: 404,
      });
    }

    // Verify that all children exist
    const children = await this.dbService.db
      .select()
      .from(childrenSchema)
      .where(inArray(childrenSchema.id, childrenIds));

    if (children.length !== childrenIds.length) {
      return APIResponse.error<undefined>({
        message: 'Some children not found',
        statusCode: 404,
      });
    }

    // Check for existing relationships
    const existingRelationships = await this.dbService.db
      .select()
      .from(childrenGroupSchema)
      .where(
        and(
          eq(childrenGroupSchema.group_id, groupId),
          inArray(childrenGroupSchema.children_id, childrenIds)
        )
      );

    if (existingRelationships.length > 0) {
      const existingChildrenIds = existingRelationships.map(
        (r) => r.children_id
      );
      return APIResponse.error<undefined>({
        message: `Children with IDs [${existingChildrenIds.join(', ')}] are already assigned to this group`,
        statusCode: 409,
      });
    }

    // Create new relationships
    const newChildrenGroups = await this.dbService.db
      .insert(childrenGroupSchema)
      .values(
        childrenIds.map((childrenId) => ({
          children_id: childrenId,
          group_id: groupId,
          status: true,
        }))
      )
      .returning();

    return APIResponse.success<ChildrenGroup[]>({
      data: newChildrenGroups as unknown as ChildrenGroup[],
      message: `Successfully assigned ${newChildrenGroups.length} children to group`,
      statusCode: 201,
    });
  }

  async findAll(
    queryDto: QueryChildrenGroupDto = {}
  ): Promise<APIResponse<ChildrenGroup[] | undefined>> {
    const page = queryDto.page ?? '1';
    const limit =
      queryDto.limit ?? APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString();
    const offset = getPageOffset(page, limit);
    const conditions: SQL<unknown>[] = [];

    if (queryDto.children_id !== undefined) {
      conditions.push(
        eq(childrenGroupSchema.children_id, Number(queryDto.children_id))
      );
    }

    if (queryDto.group_id !== undefined) {
      conditions.push(
        eq(childrenGroupSchema.group_id, Number(queryDto.group_id))
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [childrenGroups, totalCount] = await Promise.all([
      this.dbService.db
        .select({
          id: childrenGroupSchema.id,
          children_id: childrenGroupSchema.children_id,
          group_id: childrenGroupSchema.group_id,
          status: childrenGroupSchema.status,
          created_at: childrenGroupSchema.created_at,
          updated_at: childrenGroupSchema.updated_at,
          children: {
            id: childrenSchema.id,
            parent_first_name: childrenSchema.parent_first_name,
            parent_last_name: childrenSchema.parent_last_name,
            first_name: userSchema.first_name,
            last_name: userSchema.last_name,
          },
          group: {
            id: groupSchema.id,
            name: groupSchema.name,
            skill_level: groupSchema.skill_level,
            min_age: groupSchema.min_age,
            max_age: groupSchema.max_age,
          },
        })
        .from(childrenGroupSchema)
        .leftJoin(
          childrenSchema,
          eq(childrenGroupSchema.children_id, childrenSchema.id)
        )
        .leftJoin(groupSchema, eq(childrenGroupSchema.group_id, groupSchema.id))
        .leftJoin(userSchema, eq(childrenSchema.user_id, userSchema.id))
        .where(whereClause)
        .orderBy(desc(childrenGroupSchema.created_at))
        .limit(Number(limit))
        .offset(Number(offset)),
      this.dbService.db
        .select({ count: sql<number>`count(*)` })
        .from(childrenGroupSchema)
        .where(whereClause)
        .then((result) => Number(result[0]?.count ?? 0)),
    ]);

    return APIResponse.success<ChildrenGroup[]>({
      data: childrenGroups as unknown as ChildrenGroup[],
      message: 'Successfully fetched children-group relationships',
      statusCode: 200,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        count: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  }

  async findOne(id: number) {
    const childrenGroup = await this.dbService.db
      .select({
        id: childrenGroupSchema.id,
        children_id: childrenGroupSchema.children_id,
        group_id: childrenGroupSchema.group_id,
        status: childrenGroupSchema.status,
        created_at: childrenGroupSchema.created_at,
        updated_at: childrenGroupSchema.updated_at,
        children: {
          id: childrenSchema.id,
          parent_first_name: childrenSchema.parent_first_name,
          parent_last_name: childrenSchema.parent_last_name,
        },
        group: {
          id: groupSchema.id,
          name: groupSchema.name,
          skill_level: groupSchema.skill_level,
          min_age: groupSchema.min_age,
          max_age: groupSchema.max_age,
        },
      })
      .from(childrenGroupSchema)
      .leftJoin(
        childrenSchema,
        eq(childrenGroupSchema.children_id, childrenSchema.id)
      )
      .leftJoin(groupSchema, eq(childrenGroupSchema.group_id, groupSchema.id))
      .where(eq(childrenGroupSchema.id, id))
      .limit(1);

    if (childrenGroup.length === 0) {
      throw new NotFoundException('Children-group relationship not found');
    }

    return {
      message: 'Successfully fetched children-group relationship',
      data: childrenGroup[0],
    };
  }

  async update(id: number, updateChildrenGroupDto: UpdateChildrenGroupDto) {
    const existingRelationship = await this.dbService.db
      .select()
      .from(childrenGroupSchema)
      .where(eq(childrenGroupSchema.id, id))
      .limit(1);

    if (existingRelationship.length === 0) {
      throw new NotFoundException('Children-group relationship not found');
    }

    const currentRelationship = existingRelationship[0];

    const newChildrenId =
      updateChildrenGroupDto.children_id !== undefined
        ? Number(updateChildrenGroupDto.children_id)
        : (currentRelationship.children_id as number);

    const newGroupId =
      updateChildrenGroupDto.group_id !== undefined
        ? Number(updateChildrenGroupDto.group_id)
        : (currentRelationship.group_id as number);

    if (Number.isNaN(newChildrenId)) {
      throw new Error('Invalid children_id');
    }

    if (Number.isNaN(newGroupId)) {
      throw new Error('Invalid group_id');
    }

    if (
      updateChildrenGroupDto.children_id !== undefined ||
      updateChildrenGroupDto.group_id !== undefined
    ) {
      const conflictingRelationship = await this.dbService.db
        .select()
        .from(childrenGroupSchema)
        .where(
          and(
            eq(childrenGroupSchema.children_id, newChildrenId),
            eq(childrenGroupSchema.group_id, newGroupId),
            sql`${childrenGroupSchema.id} != ${id}`
          )
        )
        .limit(1);

      if (conflictingRelationship.length > 0) {
        throw new ConflictException(
          'This child is already assigned to this group'
        );
      }

      if (updateChildrenGroupDto.children_id !== undefined) {
        const children = await this.dbService.db
          .select()
          .from(childrenSchema)
          .where(eq(childrenSchema.id, newChildrenId))
          .limit(1);

        if (children.length === 0) {
          throw new NotFoundException('Child not found');
        }
      }

      if (updateChildrenGroupDto.group_id !== undefined) {
        const group = await this.dbService.db
          .select()
          .from(groupSchema)
          .where(eq(groupSchema.id, newGroupId))
          .limit(1);

        if (group.length === 0) {
          throw new NotFoundException('Group not found');
        }
      }
    }

    const updateValues: ChildrenGroupUpdateValues = {
      updated_at: new Date(),
    };

    if (updateChildrenGroupDto.children_id !== undefined) {
      updateValues.children_id = newChildrenId;
    }

    if (updateChildrenGroupDto.group_id !== undefined) {
      updateValues.group_id = newGroupId;
    }

    if (updateChildrenGroupDto.status !== undefined) {
      updateValues.status = Boolean(updateChildrenGroupDto.status);
    }

    const updatedChildrenGroup = await this.dbService.db
      .update(childrenGroupSchema)
      .set(updateValues)
      .where(eq(childrenGroupSchema.id, id))
      .returning();

    return {
      message: 'Successfully updated children-group relationship',
      data: updatedChildrenGroup[0],
    };
  }

  async remove(id: number) {
    const deletedChildrenGroup = await this.dbService.db
      .delete(childrenGroupSchema)
      .where(eq(childrenGroupSchema.id, id))
      .returning();

    if (deletedChildrenGroup.length === 0) {
      throw new NotFoundException('Children-group relationship not found');
    }

    return {
      message: 'Successfully removed children from group',
      data: deletedChildrenGroup[0],
    };
  }
}
