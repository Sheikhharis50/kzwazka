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
import {
  coachSchema,
  userSchema,
  locationSchema,
  groupSchema,
} from '../db/schemas';
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
      const existingUser = await this.userService.findByEmail(
        createCoachDto.email
      );
      if (existingUser) {
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
          phone: userSchema.phone,
          photo_url: userSchema.photo_url,
        },
        location: {
          id: locationSchema.id,
          name: locationSchema.name,
          address1: locationSchema.address1,
          city: locationSchema.city,
          state: locationSchema.state,
        },
        groups: sql<
          Array<{
            id: number;
            name: string;
            description: string | null;
            min_age: number;
            max_age: number;
            skill_level: string;
            max_group_size: number;
            created_at: Date;
            updated_at: Date;
          }>
        >`COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ${groupSchema.id},
              'name', ${groupSchema.name},
              'description', ${groupSchema.description},
              'min_age', ${groupSchema.min_age},
              'max_age', ${groupSchema.max_age},
              'skill_level', ${groupSchema.skill_level},
              'max_group_size', ${groupSchema.max_group_size},
              'created_at', ${groupSchema.created_at},
              'updated_at', ${groupSchema.updated_at}
            )
          ) FILTER (WHERE ${groupSchema.id} IS NOT NULL),
          '[]'::json
        )`,
      })
      .from(coachSchema)
      .leftJoin(userSchema, eq(coachSchema.user_id, userSchema.id))
      .leftJoin(locationSchema, eq(coachSchema.location_id, locationSchema.id))
      .leftJoin(groupSchema, eq(coachSchema.id, groupSchema.coach_id));

    // Build count query
    const countQuery = this.dbService.db
      .select({ count: sql<number>`COUNT(DISTINCT ${coachSchema.id})` })
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

    // Add GROUP BY clause for the JSON_AGG to work properly
    baseQuery.groupBy(coachSchema.id, userSchema.id, locationSchema.id);

    // Execute both queries
    const [countResult, results] = await Promise.all([
      countQuery.limit(1),
      baseQuery,
    ]);

    const count = countResult[0]?.count || 0;

    const resultswithphotoUrl = results.map((coach) => ({
      ...coach,
      user: {
        ...coach.user,
        photo_url: coach.user?.photo_url
          ? this.fileStorageService.getPhotoUrlforAPIResponse(
              coach.user.photo_url
            )
          : coach.user?.photo_url,
      },
    }));

    return {
      message: 'Coaches retrieved successfully',
      data: resultswithphotoUrl,
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
          phone: userSchema.phone,
          is_verified: userSchema.is_verified,
          photo_url: userSchema.photo_url,
        },
        location: {
          id: locationSchema.id,
          name: locationSchema.name,
          address1: locationSchema.address1,
          city: locationSchema.city,
          state: locationSchema.state,
        },
        groups: sql<
          Array<{
            id: number;
            name: string;
            description: string | null;
            min_age: number;
            max_age: number;
            skill_level: string;
            max_group_size: number;
            created_at: Date;
            updated_at: Date;
          }>
        >`COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ${groupSchema.id},
              'name', ${groupSchema.name},
              'description', ${groupSchema.description},
              'min_age', ${groupSchema.min_age},
              'max_age', ${groupSchema.max_age},
              'skill_level', ${groupSchema.skill_level},
              'max_group_size', ${groupSchema.max_group_size},
              'created_at', ${groupSchema.created_at},
              'updated_at', ${groupSchema.updated_at}
            )
          ) FILTER (WHERE ${groupSchema.id} IS NOT NULL),
          '[]'::json
        )`,
      })
      .from(coachSchema)
      .leftJoin(userSchema, eq(coachSchema.user_id, userSchema.id))
      .leftJoin(locationSchema, eq(coachSchema.location_id, locationSchema.id))
      .leftJoin(groupSchema, eq(coachSchema.id, groupSchema.coach_id))
      .where(eq(coachSchema.id, id))
      .groupBy(coachSchema.id, userSchema.id, locationSchema.id)
      .limit(1);

    if (coach.length === 0) {
      throw new NotFoundException('Coach not found');
    }

    const coachwithphotoUrl = {
      ...coach[0],
      user: {
        ...coach[0].user,
        photo_url: coach[0].user?.photo_url
          ? this.fileStorageService.getPhotoUrlforAPIResponse(
              coach[0].user.photo_url
            )
          : coach[0].user?.photo_url,
      },
    };

    return {
      message: 'Coach retrieved successfully',
      data: coachwithphotoUrl,
    };
  }

  async update(
    id: number,
    updateCoachDto: UpdateCoachDto,
    photo_url?: Express.Multer.File
  ) {
    try {
      const coach = await this.findOne(id);

      if (!coach) {
        throw new NotFoundException('Coach not found');
      }

      const user = await this.userService.findOne(coach.data.user.id!);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.userService.update(
        coach.data.user.id!,
        updateCoachDto,
        photo_url
      );

      await this.dbService.db
        .update(coachSchema)
        .set({
          location_id: updateCoachDto.location_id || null,
          updated_at: new Date(),
        })
        .where(eq(coachSchema.id, coach.data.id));

      this.logger.log(`Coach updated successfully with ID: ${coach.data.id}`);

      return {
        message: 'Coach updated successfully',
        data: {
          coach: coach.data,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to update coach: ${(error as Error).message}`);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const coach = await this.findOne(id);

      if (!coach) {
        throw new NotFoundException('Coach not found');
      }

      await this.userService.remove(coach.data.user.id!);

      await this.dbService.db
        .delete(coachSchema)
        .where(eq(coachSchema.id, coach.data.id));

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
}
