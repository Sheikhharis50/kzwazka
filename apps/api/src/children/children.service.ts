import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { DatabaseService } from '../db/drizzle.service';
import { eq } from 'drizzle-orm';
import { childrenSchema, userSchema, locationSchema } from '../db/schemas';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ChildrenService {
  constructor(private readonly db: DatabaseService) {}

  async create(createChildDto: CreateChildDto) {
    const childId = uuidv4();
    const newChild = await this.db.db
      .insert(childrenSchema)
      .values({
        id: childId,
        ...createChildDto,
        dob: new Date(createChildDto.dob).toISOString(),
      })
      .returning();

    return newChild[0];
  }

  async findAll() {
    return await this.db.db
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
      .leftJoin(locationSchema, eq(childrenSchema.location_id, locationSchema.id));
  }

  async findOne(id: string) {
    const child = await this.db.db
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
      .leftJoin(locationSchema, eq(childrenSchema.location_id, locationSchema.id))
      .where(eq(childrenSchema.id, id))
      .limit(1);

    if (child.length === 0) {
      throw new NotFoundException('Child not found');
    }

    return child[0];
  }

  async findByUserId(userId: string) {
    return await this.db.db
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
      .leftJoin(locationSchema, eq(childrenSchema.location_id, locationSchema.id))
      .where(eq(childrenSchema.user_id, userId));
  }

  async update(id: string, updateChildDto: UpdateChildDto) {
    const updateValues = {
      ...updateChildDto,
      ...(updateChildDto.dob && { dob: new Date(updateChildDto.dob).toISOString() }),
      updated_at: new Date(),
    };

    const updatedChild = await this.db.db
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
    const deletedChild = await this.db.db
      .delete(childrenSchema)
      .where(eq(childrenSchema.id, id))
      .returning();

    if (deletedChild.length === 0) {
      throw new NotFoundException('Child not found');
    }

    return { message: 'Child deleted successfully' };
  }

  async updatePhotoUrl(id: string, photoUrl: string) {
    const updatedChild = await this.db.db
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
    const updatedChild = await this.db.db
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
