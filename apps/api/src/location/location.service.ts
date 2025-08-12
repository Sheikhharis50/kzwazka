import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../db/drizzle.service';
import { eq } from 'drizzle-orm';
import { locationSchema } from '../db/schemas';
import { CreateLocationDto } from './dto/create-location.dto';
@Injectable()
export class LocationService {
  constructor(private readonly db: DatabaseService) {}

  async create(createLocationDto: CreateLocationDto) {
    const { opening_time, closing_time, ...locationData } = createLocationDto;

    const newLocation = await this.db.db
      .insert(locationSchema)
      .values({
        ...locationData,
        opening_time: opening_time || null,
        closing_time: closing_time || null,
        is_active: true,
      })
      .returning();

    return {
      message: 'Successfully created location',
      data: newLocation[0],
    };
  }

  async findAll() {
    const locations = await this.db.db
      .select()
      .from(locationSchema)
      .where(eq(locationSchema.is_active, true));

    return {
      message: 'Successfully fetched locations',
      data: locations,
    };
  }

  async findOne(id: number) {
    const location = await this.db.db
      .select()
      .from(locationSchema)
      .where(eq(locationSchema.id, id))
      .limit(1);

    if (location.length === 0) {
      throw new NotFoundException('Location not found');
    }

    return {
      message: 'Successfully fetched location',
      data: location[0],
    };
  }

  async update(id: number, updateLocationDto: Partial<CreateLocationDto>) {
    const { opening_time, closing_time, ...updateData } = updateLocationDto;

    const updateValues = {
      ...updateData,
      ...(opening_time !== undefined && { opening_time }),
      ...(closing_time !== undefined && { closing_time }),
      updated_at: new Date(),
    };

    const updatedLocation = await this.db.db
      .update(locationSchema)
      .set(updateValues)
      .where(eq(locationSchema.id, id))
      .returning();

    if (updatedLocation.length === 0) {
      throw new NotFoundException('Location not found');
    }

    return {
      message: 'Successfully updated location',
      data: updatedLocation[0],
    };
  }

  async remove(id: number) {
    const deletedLocation = await this.db.db
      .delete(locationSchema)
      .where(eq(locationSchema.id, id))
      .returning();

    if (deletedLocation.length === 0) {
      throw new NotFoundException('Location not found');
    }

    return {
      message: 'Successfully deleted location',
      data: deletedLocation[0],
    };
  }

  async deactivate(id: number) {
    const updatedLocation = await this.db.db
      .update(locationSchema)
      .set({
        is_active: false,
        updated_at: new Date(),
      })
      .where(eq(locationSchema.id, id))
      .returning();

    if (updatedLocation.length === 0) {
      throw new NotFoundException('Location not found');
    }

    return {
      message: 'Successfully deactivated location',
      data: updatedLocation[0],
    };
  }
}
