import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../db/drizzle.service';
import { eq } from 'drizzle-orm';
import { locationSchema } from '../db/schemas';
import { v4 as uuidv4 } from 'uuid';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationService {
  constructor(private readonly db: DatabaseService) {}

  async create(createLocationDto: CreateLocationDto) {
    const locationId = uuidv4();
    const { opening_time, closing_time, ...locationData } = createLocationDto;

    const newLocation = await this.db.db
      .insert(locationSchema)
      .values({
        id: locationId,
        ...locationData,
        opening_time: opening_time || null,
        closing_time: closing_time || null,
        is_active: createLocationDto.is_active ?? true,
      })
      .returning();

    return newLocation[0];
  }

  async findAll() {
    return await this.db.db
      .select()
      .from(locationSchema)
      .where(eq(locationSchema.is_active, true));
  }

  async findOne(id: string) {
    const location = await this.db.db
      .select()
      .from(locationSchema)
      .where(eq(locationSchema.id, id))
      .limit(1);

    if (location.length === 0) {
      throw new NotFoundException('Location not found');
    }

    return location[0];
  }

  async update(id: string, updateLocationDto: Partial<CreateLocationDto>) {
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

    return updatedLocation[0];
  }

  async remove(id: string) {
    const deletedLocation = await this.db.db
      .delete(locationSchema)
      .where(eq(locationSchema.id, id))
      .returning();

    if (deletedLocation.length === 0) {
      throw new NotFoundException('Location not found');
    }

    return { message: 'Location deleted successfully' };
  }

  async deactivate(id: string) {
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

    return updatedLocation[0];
  }
}
