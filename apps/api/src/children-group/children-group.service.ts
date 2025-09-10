import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DatabaseService } from '../db/drizzle.service';
import { eq, and, desc, sql, inArray, SQLWrapper } from 'drizzle-orm';
import {
  childrenGroupSchema,
  childrenSchema,
  groupSchema,
} from '../db/schemas';
import { CreateChildrenGroupDto } from './dto/create-children-group.dto';
import { UpdateChildrenGroupDto } from './dto/update-children-group.dto';
import { QueryChildrenGroupDto } from './dto/query-children-group.dto';
import { GroupService } from '../group/group.service';

@Injectable()
export class ChildrenGroupService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly groupService: GroupService
  ) {}

  async create(createChildrenGroupDto: CreateChildrenGroupDto) {
    const { children_ids, group_id } = createChildrenGroupDto;

    // Verify that the group exists
    const group = await this.groupService.findOne(group_id);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    // Verify that all children exist
    const children = await this.dbService.db
      .select()
      .from(childrenSchema)
      .where(inArray(childrenSchema.id, children_ids));

    if (children.length !== children_ids.length) {
      throw new NotFoundException('Some children not found');
    }

    // Check for existing relationships
    const existingRelationships = await this.dbService.db
      .select()
      .from(childrenGroupSchema)
      .where(
        and(
          eq(childrenGroupSchema.group_id, group_id),
          inArray(childrenGroupSchema.children_id, children_ids)
        )
      );

    if (existingRelationships.length > 0) {
      const existingChildrenIds = existingRelationships.map(
        (r) => r.children_id
      );
      throw new ConflictException(
        `Children with IDs [${existingChildrenIds.join(', ')}] are already assigned to this group`
      );
    }

    // Create new relationships
    const newChildrenGroups = await this.dbService.db
      .insert(childrenGroupSchema)
      .values(
        children_ids.map((childrenId) => ({
          children_id: childrenId,
          group_id: group_id,
          status: true,
        }))
      )
      .returning();

    return {
      message: `Successfully assigned ${newChildrenGroups.length} children to group`,
      data: newChildrenGroups,
    };
  }

  async findAll(queryDto: QueryChildrenGroupDto = {}) {
    const { children_id, group_id, status, page = 1, limit = 10 } = queryDto;

    const offset = (page - 1) * limit;
    const conditions: SQLWrapper[] = [];

    if (children_id) {
      conditions.push(eq(childrenGroupSchema.children_id, children_id));
    }

    if (group_id) {
      conditions.push(eq(childrenGroupSchema.group_id, group_id));
    }

    if (status !== undefined) {
      conditions.push(eq(childrenGroupSchema.status, status));
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
        .where(whereClause)
        .orderBy(desc(childrenGroupSchema.created_at))
        .limit(limit)
        .offset(offset),
      this.dbService.db
        .select({ count: sql<number>`count(*)` })
        .from(childrenGroupSchema)
        .where(whereClause)
        .then((result) => Number(result[0]?.count || 0)),
    ]);

    return {
      message: 'Successfully fetched children-group relationships',
      data: childrenGroups,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
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
    const { children_id, group_id, status } = updateChildrenGroupDto;

    // Check if the relationship exists
    const existingRelationship = await this.dbService.db
      .select()
      .from(childrenGroupSchema)
      .where(eq(childrenGroupSchema.id, id))
      .limit(1);

    if (existingRelationship.length === 0) {
      throw new NotFoundException('Children-group relationship not found');
    }

    // If updating children_id or group_id, check for conflicts
    if (children_id || group_id) {
      const currentRelationship = existingRelationship[0];
      const newChildrenId = children_id || currentRelationship.children_id;
      const newGroupId = group_id || currentRelationship.group_id;

      // Check if the new combination already exists (excluding current record)
      const conflictingRelationship = await this.dbService.db
        .select()
        .from(childrenGroupSchema)
        .where(
          and(
            eq(childrenGroupSchema.children_id, newChildrenId as number),
            eq(childrenGroupSchema.group_id, newGroupId as number),
            sql`${childrenGroupSchema.id} != ${id}`
          )
        )
        .limit(1);

      if (conflictingRelationship.length > 0) {
        throw new ConflictException(
          'This children is already assigned to this group'
        );
      }

      // Verify that both children and group exist
      if (children_id) {
        const children = await this.dbService.db
          .select()
          .from(childrenSchema)
          .where(eq(childrenSchema.id, children_id))
          .limit(1);

        if (children.length === 0) {
          throw new NotFoundException('Children not found');
        }
      }

      if (group_id) {
        const group = await this.dbService.db
          .select()
          .from(groupSchema)
          .where(eq(groupSchema.id, group_id))
          .limit(1);

        if (group.length === 0) {
          throw new NotFoundException('Group not found');
        }
      }
    }

    const updateValues = {
      ...(children_id !== undefined && { children_id }),
      ...(group_id !== undefined && { group_id }),
      ...(status !== undefined && { status }),
      updated_at: new Date(),
    };

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
