import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { DatabaseService } from '../db/drizzle.service';
import { eq, sql } from 'drizzle-orm';
import { childrenSchema, userSchema, locationSchema } from '../db/schemas';
import { APP_CONSTANTS } from '../utils/constants';
import { getPageOffset } from '../utils/pagination';

@Injectable()
export class ChildrenService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(body: CreateChildDto) {
    const newChild = await this.dbService.db
      .insert(childrenSchema)
      .values({
        ...body,
        dob: new Date(body.dob).toISOString(),
      })
      .returning();

    return {
      detail: 'Children created successfully',
      data: newChild[0],
    };
  }

  async count() {
    const [{ count }] = await this.dbService.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(childrenSchema)
      .limit(1);
    return count;
  }

  async findAll(params: { page: string; limit: string }) {
    const { page = '1', limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString() } = params;

    const offset = getPageOffset(page, limit);

    const [count, results] = await Promise.all([
      this.count(),
      this.dbService.db
        .select({
          id: childrenSchema.id,
          dob: childrenSchema.dob,
          photo_url: childrenSchema.photo_url,
          parent_first_name: childrenSchema.parent_first_name,
          parent_last_name: childrenSchema.parent_last_name,
          created_at: childrenSchema.created_at,
          updated_at: childrenSchema.updated_at,
          user: {
            id: userSchema.id,
            first_name: userSchema.first_name,
            last_name: userSchema.last_name,
            email: userSchema.email,
          },
          location: {
            id: locationSchema.id,
            name: locationSchema.name,
            address1: locationSchema.address1,
            city: locationSchema.city,
            state: locationSchema.state,
          },
        })
        .from(childrenSchema)
        .leftJoin(userSchema, eq(childrenSchema.user_id, userSchema.id))
        .leftJoin(
          locationSchema,
          eq(childrenSchema.location_id, locationSchema.id)
        )
        .offset(offset)
        .limit(Number(limit)),
    ]);

    return {
      detail: 'Children records',
      data: results,
      page,
      limit,
      count,
    };
  }

  async findOne(id: number) {
    const child = await this.dbService.db
      .select({
        id: childrenSchema.id,
        dob: childrenSchema.dob,
        photo_url: childrenSchema.photo_url,
        parent_first_name: childrenSchema.parent_first_name,
        parent_last_name: childrenSchema.parent_last_name,
        created_at: childrenSchema.created_at,
        updated_at: childrenSchema.updated_at,
        user: {
          id: userSchema.id,
          first_name: userSchema.first_name,
          last_name: userSchema.last_name,
          email: userSchema.email,
        },
        location: {
          id: locationSchema.id,
          name: locationSchema.name,
          address1: locationSchema.address1,
          city: locationSchema.city,
          state: locationSchema.state,
        },
      })
      .from(childrenSchema)
      .leftJoin(userSchema, eq(childrenSchema.user_id, userSchema.id))
      .leftJoin(
        locationSchema,
        eq(childrenSchema.location_id, locationSchema.id)
      )
      .where(eq(childrenSchema.id, id))
      .limit(1);

    if (child.length === 0) {
      throw new NotFoundException('Child not found');
    }

    return {
      detail: 'Child record',
      data: child[0],
    };
  }

  async findByUserId(userId: number) {
    return await this.dbService.db
      .select({
        id: childrenSchema.id,
        dob: childrenSchema.dob,
        photo_url: childrenSchema.photo_url,
        parent_first_name: childrenSchema.parent_first_name,
        parent_last_name: childrenSchema.parent_last_name,
        created_at: childrenSchema.created_at,
        updated_at: childrenSchema.updated_at,
        user: {
          id: userSchema.id,
          first_name: userSchema.first_name,
          last_name: userSchema.last_name,
          email: userSchema.email,
        },
        location: {
          id: locationSchema.id,
          name: locationSchema.name,
          address1: locationSchema.address1,
          city: locationSchema.city,
          state: locationSchema.state,
        },
      })
      .from(childrenSchema)
      .leftJoin(userSchema, eq(childrenSchema.user_id, userSchema.id))
      .leftJoin(
        locationSchema,
        eq(childrenSchema.location_id, locationSchema.id)
      )
      .where(eq(childrenSchema.user_id, userId));
  }

  async update(id: number, updateChildDto: UpdateChildDto) {
    const updateValues = {
      ...updateChildDto,
      ...(updateChildDto.dob && {
        dob: new Date(updateChildDto.dob).toISOString(),
      }),
      updated_at: new Date(),
    };

    const updatedChild = await this.dbService.db
      .update(childrenSchema)
      .set(updateValues)
      .where(eq(childrenSchema.id, id))
      .returning();

    if (updatedChild.length === 0) {
      throw new NotFoundException('Child not found');
    }

    return {
      detail: 'Child updated successfully',
      data: updatedChild[0],
    };
  }

  async remove(id: number) {
    const deletedChild = await this.dbService.db
      .delete(childrenSchema)
      .where(eq(childrenSchema.id, id))
      .returning();

    if (deletedChild.length === 0) {
      throw new NotFoundException('Child not found');
    }

    return {
      detail: 'Child deleted successfully',
    };
  }

  async updatePhotoUrl(id: number, photoUrl: string) {
    const updatedChild = await this.dbService.db
      .update(childrenSchema)
      .set({
        photo_url: photoUrl,
        updated_at: new Date(),
      })
      .where(eq(childrenSchema.id, id))
      .returning();

    if (updatedChild.length === 0) {
      throw new NotFoundException('Child not found');
    }

    return {
      detail: 'Photo URL updated successfully',
      data: updatedChild[0],
    };
  }

  async assignLocation(childId: number, locationId: number) {
    const updatedChild = await this.dbService.db
      .update(childrenSchema)
      .set({
        location_id: locationId,
        updated_at: new Date(),
      })
      .where(eq(childrenSchema.id, childId))
      .returning();

    if (updatedChild.length === 0) {
      throw new NotFoundException('Child not found');
    }

    return {
      detail: 'Location assigned successfully',
      data: updatedChild[0],
    };
  }
}
