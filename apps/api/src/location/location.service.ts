import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../db/drizzle.service';
import { eq, asc } from 'drizzle-orm';
import { locationSchema } from '../db/schemas';
import { CreateLocationDto } from './dto/create-location.dto';
import { FileStorageService } from '../services/file-storage.service';

@Injectable()
export class LocationService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly fileStorageService: FileStorageService
  ) {}

  async create(
    createLocationDto: CreateLocationDto,
    photo_url: Express.Multer.File
  ) {
    const { opening_time, closing_time, ...locationData } = createLocationDto;

    const newLocation = await this.dbService.db
      .insert(locationSchema)
      .values({
        ...locationData,
        opening_time: opening_time || null,
        closing_time: closing_time || null,
        is_active: true,
      })
      .returning();

    if (photo_url) {
      const photoUrl = await this.updatePhotoUrl(newLocation[0].id, photo_url);
      newLocation[0].photo_url = photoUrl.data.photo_url
        ? this.fileStorageService.getAbsoluteUrl(photoUrl.data.photo_url)
        : null;
    }

    return {
      message: 'Successfully created location',
      data: newLocation[0],
    };
  }

  /**
   * Optimized findAll method with proper sorting
   */
  async findAll() {
    const locations = await this.dbService.db
      .select()
      .from(locationSchema)
      .where(eq(locationSchema.is_active, true))
      .orderBy(asc(locationSchema.name));

    locations.forEach((location) => {
      location.photo_url = location.photo_url
        ? this.fileStorageService.getAbsoluteUrl(location.photo_url)
        : null;
    });

    return {
      message: 'Successfully fetched locations',
      data: locations,
    };
  }

  /**
   * Optimized findOne method
   */
  async findOne(id: number) {
    const location = await this.dbService.db
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

  async update(
    id: number,
    updateLocationDto: Partial<CreateLocationDto>,
    photo_url: Express.Multer.File
  ) {
    const { opening_time, closing_time, ...updateData } = updateLocationDto;

    const updateValues = {
      ...updateData,
      ...(opening_time !== undefined && { opening_time }),
      ...(closing_time !== undefined && { closing_time }),
      updated_at: new Date(),
    };

    const updatedLocation = await this.dbService.db
      .update(locationSchema)
      .set(updateValues)
      .where(eq(locationSchema.id, id))
      .returning();

    if (updatedLocation.length === 0) {
      throw new NotFoundException('Location not found');
    }

    if (photo_url) {
      const photoUrl = await this.updatePhotoUrl(id, photo_url);
      updatedLocation[0].photo_url = photoUrl.data.photo_url
        ? this.fileStorageService.getAbsoluteUrl(photoUrl.data.photo_url)
        : null;
    }

    return {
      message: 'Successfully updated location',
      data: updatedLocation[0],
    };
  }

  async remove(id: number) {
    const deletedLocation = await this.dbService.db
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
    const updatedLocation = await this.dbService.db
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

  async updatePhotoUrl(id: number, photo_url: Express.Multer.File) {
    const photoUrl = await this.fileStorageService.uploadFile(
      photo_url,
      'location',
      id
    );

    const updatedLocation = await this.dbService.db
      .update(locationSchema)
      .set({ photo_url: photoUrl.relativePath })
      .where(eq(locationSchema.id, id))
      .returning();

    return {
      message: 'Successfully updated photo URL',
      data: updatedLocation[0],
    };
  }
}
