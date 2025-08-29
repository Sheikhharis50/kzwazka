import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import { DatabaseService } from '../db/drizzle.service';
import { UserService } from '../user/user.service';
import { eq, sql } from 'drizzle-orm';
import { coachSchema, userSchema, locationSchema, Coach } from '../db/schemas';
import { APP_CONSTANTS } from '../utils/constants';
import { getPageOffset } from '../utils/pagination';
import { QueryCoachDto } from './dto/query-coach.dto';
import { FileStorageService } from '../services';

@Injectable()
export class CoachService {
  private readonly logger = new Logger(CoachService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly userService: UserService,
    private readonly fileStorageService: FileStorageService
  ) {}

  async create(
    createCoachDto: CreateCoachDto,
    photo_file?: Express.Multer.File
  ) {
    try {
      // Check if coach with this email already exists
      const existingCoach = await this.dbService.db
        .select()
        .from(userSchema)
        .where(eq(userSchema.email, createCoachDto.email))
        .limit(1);

      if (existingCoach.length > 0) {
        throw new ConflictException('User with this email already exists');
      }

      // Handle photo upload if provided
      let photo_url: string | undefined;
      if (photo_file) {
        try {
          // Upload photo to storage (will use local or DigitalOcean based on environment)
          const uploadResult = await this.fileStorageService.uploadFile(
            photo_file,
            'avatars',
            Date.now()
          );
          photo_url = uploadResult.relativePath;
        } catch (error) {
          throw new Error(
            `Failed to upload photo: ${(error as Error).message}`
          );
        }
      }

      // Get the coach role
      const coachRole = await this.userService.getRoleByName('coach');
      if (!coachRole) {
        throw new Error('Coach role not found in system');
      }

      // Create user first
      const newUser = await this.userService.create({
        email: createCoachDto.email,
        first_name: createCoachDto.first_name,
        last_name: createCoachDto.last_name,
        password: createCoachDto.password,
        phone: createCoachDto.phone,
        role_id: coachRole.id,
        is_active: true,
        is_verified: true, // Coaches are typically pre-verified
        photo_url: photo_url,
      });

      // Create coach record
      const newCoach = await this.dbService.db
        .insert(coachSchema)
        .values({
          user_id: newUser.id,
          location_id: createCoachDto.location_id || null,
        })
        .returning();

      this.logger.log(`Coach created successfully with ID: ${newCoach[0].id}`);

      return {
        message: 'Coach created successfully',
        data: {
          coach: newCoach[0],
          user: {
            id: newUser.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            phone: newUser.phone,
            role: coachRole.name,
            photo_url: photo_url,
          },
        },
      };
    } catch (error) {
      this.logger.error(`Failed to create coach: ${(error as Error).message}`);
      throw error;
    }
  }

  async count() {
    const [{ count }] = await this.dbService.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(coachSchema)
      .limit(1);
    return count;
  }

  async findAll(params: QueryCoachDto) {
    const {
      page = 1,
      limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
      search,
      location_id,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = params;

    const offset = getPageOffset(page.toString(), limit.toString());

    // Build the base query
    const baseQuery = this.dbService.db
      .select({
        id: coachSchema.id,
        created_at: coachSchema.created_at,
        updated_at: coachSchema.updated_at,
        user: {
          id: userSchema.id,
          first_name: userSchema.first_name,
          last_name: userSchema.last_name,
          email: userSchema.email,
          is_active: userSchema.is_active,
          is_verified: userSchema.is_verified,
        },
        location: {
          id: locationSchema.id,
          name: locationSchema.name,
          address1: locationSchema.address1,
          city: locationSchema.city,
          state: locationSchema.state,
        },
      })
      .from(coachSchema)
      .leftJoin(userSchema, eq(coachSchema.user_id, userSchema.id))
      .leftJoin(locationSchema, eq(coachSchema.location_id, locationSchema.id));

    // Build count query
    const countQuery = this.dbService.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(coachSchema)
      .leftJoin(userSchema, eq(coachSchema.user_id, userSchema.id))
      .leftJoin(locationSchema, eq(coachSchema.location_id, locationSchema.id));

    // Apply search filter if search parameter is provided
    if (search) {
      const searchCondition = sql`(${userSchema.first_name} ILIKE ${`%${search}%`} OR ${userSchema.last_name} ILIKE ${`%${search}%`})`;
      baseQuery.where(searchCondition);
      countQuery.where(searchCondition);
    }

    // Apply location filter
    if (location_id) {
      baseQuery.where(eq(coachSchema.location_id, location_id));
      countQuery.where(eq(coachSchema.location_id, location_id));
    }

    // Apply sorting
    if (sort_by === 'created_at') {
      baseQuery.orderBy(
        sort_order === 'asc'
          ? coachSchema.created_at
          : sql`${coachSchema.created_at} DESC`
      );
    } else if (sort_by === 'name') {
      baseQuery.orderBy(
        sort_order === 'asc'
          ? userSchema.first_name
          : sql`${userSchema.first_name} DESC`
      );
    }

    // Apply pagination
    baseQuery.offset(offset).limit(limit);

    // Execute both queries
    const [countResult, results] = await Promise.all([
      countQuery.limit(1),
      baseQuery,
    ]);

    const count = countResult[0]?.count || 0;

    return {
      message: 'Coaches retrieved successfully',
      data: results,
      page,
      limit,
      count,
    };
  }

  async findOne(id: number) {
    const coach = await this.dbService.db
      .select({
        id: coachSchema.id,
        created_at: coachSchema.created_at,
        updated_at: coachSchema.updated_at,
        user: {
          id: userSchema.id,
          first_name: userSchema.first_name,
          last_name: userSchema.last_name,
          email: userSchema.email,
          is_active: userSchema.is_active,
          is_verified: userSchema.is_verified,
        },
        location: {
          id: locationSchema.id,
          name: locationSchema.name,
          address1: locationSchema.address1,
          city: locationSchema.city,
          state: locationSchema.state,
        },
      })
      .from(coachSchema)
      .leftJoin(userSchema, eq(coachSchema.user_id, userSchema.id))
      .leftJoin(locationSchema, eq(coachSchema.location_id, locationSchema.id))
      .where(eq(coachSchema.id, id))
      .limit(1);

    if (coach.length === 0) {
      throw new NotFoundException('Coach not found');
    }

    return {
      message: 'Coach retrieved successfully',
      data: coach[0],
    };
  }

  async update(id: number, updateCoachDto: UpdateCoachDto) {
    try {
      // Check if coach exists
      const existingCoach = await this.dbService.db
        .select()
        .from(userSchema)
        .where(eq(userSchema.id, id))
        .limit(1);

      if (existingCoach.length === 0) {
        throw new NotFoundException('Coach not found');
      }

      // Check if email is being updated and if it conflicts with existing coach
      if (
        updateCoachDto.email &&
        updateCoachDto.email !== existingCoach[0].email
      ) {
        const emailConflict = await this.dbService.db
          .select()
          .from(userSchema)
          .where(eq(userSchema.email, updateCoachDto.email))
          .limit(1);

        if (emailConflict.length > 0) {
          throw new ConflictException('User with this email already exists');
        }
      }

      // Prepare update data with proper type conversion
      const updateData: Partial<Coach> = {};
      if (updateCoachDto.location_id)
        updateData.location_id = updateCoachDto.location_id;

      // Update coach record
      const updatedCoach = await this.dbService.db
        .update(coachSchema)
        .set({
          ...updateData,
          updated_at: new Date(),
        })
        .where(eq(coachSchema.id, id))
        .returning();

      this.logger.log(`Coach updated successfully with ID: ${id}`);

      return {
        message: 'Coach updated successfully',
        data: updatedCoach[0],
      };
    } catch (error) {
      this.logger.error(`Failed to update coach: ${(error as Error).message}`);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      // Check if coach exists and get the user_id and photo_url
      const existingCoach = await this.dbService.db
        .select({
          user_id: coachSchema.user_id,
          user: {
            photo_url: userSchema.photo_url,
          },
        })
        .from(coachSchema)
        .leftJoin(userSchema, eq(coachSchema.user_id, userSchema.id))
        .where(eq(coachSchema.id, id))
        .limit(1);

      if (existingCoach.length === 0) {
        throw new NotFoundException('Coach not found');
      }

      const userId = existingCoach[0].user_id;
      const photoUrl = existingCoach[0].user?.photo_url;

      if (!userId) {
        throw new Error('Coach record has no associated user');
      }

      // Delete profile photo from storage if it exists
      if (photoUrl && photoUrl.startsWith('/')) {
        try {
          await this.fileStorageService.deleteFile(photoUrl);
          this.logger.log(`Profile photo deleted from storage: ${photoUrl}`);
        } catch (error) {
          // Log error but don't prevent user deletion
          this.logger.error(
            `Failed to delete profile photo: ${(error as Error).message}`
          );
        }
      }

      // Use transaction to delete both coach and user records
      await this.dbService.db.transaction(async (tx) => {
        // Delete coach record first
        await tx.delete(coachSchema).where(eq(coachSchema.id, id));

        // Delete the associated user record
        await tx.delete(userSchema).where(eq(userSchema.id, userId));
      });

      return {
        message: 'Coach deleted successfully',
      };
    } catch (error) {
      this.logger.error(
        `Failed to delete coach and user: ${(error as Error).message}`
      );
      throw error;
    }
  }

  /**
   * Update coach profile photo
   */
  async updatePhoto(id: number, photo_file: Express.Multer.File) {
    try {
      // Get the coach to find the user_id
      const coach = await this.dbService.db
        .select({ user_id: coachSchema.user_id })
        .from(coachSchema)
        .where(eq(coachSchema.id, id))
        .limit(1);

      if (coach.length === 0) {
        throw new NotFoundException('Coach not found');
      }

      const userId = coach[0].user_id;

      if (!userId) {
        throw new Error('Coach record has no associated user');
      }

      // Upload new photo to storage
      const uploadResult = await this.fileStorageService.uploadFile(
        photo_file,
        'avatars',
        Date.now()
      );

      // Update user with new photo URL
      const updatedUser = await this.dbService.db
        .update(userSchema)
        .set({
          photo_url: uploadResult.relativePath,
          updated_at: new Date(),
        })
        .where(eq(userSchema.id, userId))
        .returning();

      if (updatedUser.length === 0) {
        throw new NotFoundException('User not found');
      }

      this.logger.log(`Coach photo updated successfully for ID: ${id}`);

      return {
        message: 'Profile photo updated successfully',
        data: {
          id: updatedUser[0].id,
          photo_url: uploadResult.relativePath,
          cdn_url: uploadResult.url,
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to update coach photo: ${(error as Error).message}`
      );
      throw error;
    }
  }
}
