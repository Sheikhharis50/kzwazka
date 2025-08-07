import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { DatabaseService } from '../db/drizzle.service';
import { eq, sql } from 'drizzle-orm';
import { childrenSchema, userSchema, locationSchema } from '../db/schemas';
import { v4 as uuidv4 } from 'uuid';
import { DEFAULT_PAGE_SIZE } from '../app.constants';
import { getPageOffset } from '../utils/pagination';

@Injectable()
export class ChildrenService {
  constructor(private readonly dbService: DatabaseService) {}

  async create(body: CreateChildDto) {
    const childId = uuidv4();
    const newChild = await this.dbService.db
      .insert(childrenSchema)
      .values({
        id: childId,
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
    const { page = '1', limit = DEFAULT_PAGE_SIZE } = params;

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

  async findOne(id: string) {
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

    return child[0];
  }

  async findByUserId(userId: string) {
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

  async update(id: string, updateChildDto: UpdateChildDto) {
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

    return updatedChild[0];
  }

  async remove(id: string) {
    const deletedChild = await this.dbService.db
      .delete(childrenSchema)
      .where(eq(childrenSchema.id, id))
      .returning();

    if (deletedChild.length === 0) {
      throw new NotFoundException('Child not found');
    }

    return { message: 'Child deleted successfully' };
  }

  async updatePhotoUrl(id: string, photoUrl: string) {
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

    return updatedChild[0];
  }

  async assignLocation(childId: string, locationId: string) {
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

    return updatedChild[0];
  }
}
