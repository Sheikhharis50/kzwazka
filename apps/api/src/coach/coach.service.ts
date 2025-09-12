import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CreateCoachDto } from './dto/create-coach.dto';
import { UpdateCoachDto } from './dto/update-coach.dto';
import { DatabaseService } from '../db/drizzle.service';
import { UserService } from '../user/user.service';
import { eq, sql, and, or, ilike, desc, asc, inArray, SQL } from 'drizzle-orm';
import {
  coachSchema,
  userSchema,
  locationSchema,
  groupSchema,
  Coach,
} from '../db/schemas';
import { APP_CONSTANTS } from '../utils/constants';
import { getPageOffset } from '../utils/pagination';
import { QueryCoachDto } from './dto/query-coach.dto';
import { FileStorageService } from '../services';
import { APIResponse } from '../utils/response';
import { CoachWithUserAndLocationGroup } from './coach.types';

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
    photo_url?: Express.Multer.File
  ): Promise<APIResponse<Coach | undefined>> {
    try {
      // Check if coach with this email already exists
      const existingUser = await this.userService.findByEmail(
        createCoachDto.email
      );
      if (existingUser) {
        return APIResponse.error<undefined>({
          message: 'User with this email already exists',
          statusCode: 409,
        });
      }

      // Handle photo upload if provided

      // Get the coach role
      const coachRole = await this.userService.getRoleByName('coach');
      if (!coachRole) {
        return APIResponse.error<undefined>({
          message: 'Coach role not found in system',
          statusCode: 500,
        });
      }

      // Create user first
      const newUser = await this.userService.create({
        email: createCoachDto.email,
        first_name: createCoachDto.first_name,
        last_name: createCoachDto.last_name,
        password: await this.userService.hashPassword(createCoachDto.password),
        phone: createCoachDto.phone,
        role_id: coachRole.id,
        is_active: true,
        is_verified: true, // Coaches are typically pre-verified
      });

      if (photo_url) {
        await this.userService.updatePhotoUrl(newUser.id, photo_url);
      }

      // Create coach record
      const newCoach = await this.dbService.db
        .insert(coachSchema)
        .values({
          user_id: newUser.id,
          location_id: createCoachDto.location_id || null,
        })
        .returning();

      this.logger.log(`Coach created successfully with ID: ${newCoach[0].id}`);

      return APIResponse.success({
        message: 'Coach created successfully',
        data: {
          ...newCoach[0],
          user: {
            id: newUser.id,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            phone: newUser.phone,
            role_id: newUser.role_id,
            is_active: newUser.is_active,
            is_verified: newUser.is_verified,
            photo_url: newUser.photo_url,
          },
        },
        statusCode: 201,
      });
    } catch (error) {
      this.logger.error(`Failed to create coach: ${(error as Error).message}`);
      return APIResponse.error<undefined>({
        message: 'Failed to create coach',
        statusCode: 500,
      });
    }
  }

  /**
   * Optimized count method - uses simple COUNT without unnecessary joins
   */
  async count() {
    const [{ count }] = await this.dbService.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(coachSchema);
    return count;
  }

  /**
   * Helper method to normalize search terms and handle extra spaces
   */
  private normalizeSearchTerm(searchTerm: string): string {
    return searchTerm.trim().replace(/\s+/g, ' ');
  }

  /**
   * Helper method to build search conditions with improved logic
   */
  private buildSearchConditions(searchTerm: string): SQL | null {
    const normalizedSearch = this.normalizeSearchTerm(searchTerm);
    const searchWords = normalizedSearch
      .split(' ')
      .filter((word) => word.length > 0);

    if (searchWords.length === 0) return null;

    const conditions: SQL[] = [];

    // Single word search - search in first_name, last_name, or email
    if (searchWords.length === 1) {
      const word = `%${searchWords[0]}%`;
      conditions.push(
        or(
          ilike(userSchema.first_name, word),
          ilike(userSchema.last_name, word),
          ilike(userSchema.email, word)
        )!
      );
    } else {
      // Multiple words - try different combinations
      const firstWord = `%${searchWords[0]}%`;
      const lastWord = `%${searchWords[searchWords.length - 1]}%`;
      const fullSearch = `%${normalizedSearch}%`;

      // Search for full term in first_name or last_name
      conditions.push(
        or(
          ilike(userSchema.first_name, fullSearch),
          ilike(userSchema.last_name, fullSearch)
        )!
      );

      // Search for first word in first_name and last word in last_name
      conditions.push(
        and(
          ilike(userSchema.first_name, firstWord),
          ilike(userSchema.last_name, lastWord)
        )!
      );

      // Search for last word in first_name and first word in last_name (reverse)
      conditions.push(
        and(
          ilike(userSchema.first_name, lastWord),
          ilike(userSchema.last_name, firstWord)
        )!
      );
    }

    return or(...conditions)!;
  }

  /**
   * Optimized findAll method - eliminates N+1 problem with separate queries
   */
  async findAll(
    params: QueryCoachDto
  ): Promise<APIResponse<CoachWithUserAndLocationGroup[]>> {
    const {
      page = 1,
      limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT,
      search,
      location_id,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = params;

    const offset = getPageOffset(page.toString(), limit.toString());

    // Build optimized base query for coaches without groups (eliminates N+1)
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
      })
      .from(coachSchema)
      .innerJoin(userSchema, eq(coachSchema.user_id, userSchema.id))
      .leftJoin(locationSchema, eq(coachSchema.location_id, locationSchema.id));

    // Build optimized count query
    const countQuery = this.dbService.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(coachSchema)
      .innerJoin(userSchema, eq(coachSchema.user_id, userSchema.id))
      .leftJoin(locationSchema, eq(coachSchema.location_id, locationSchema.id));

    // Build where conditions array
    const whereConditions: SQL[] = [];

    // Apply search filter with improved logic
    if (search) {
      const searchCondition = this.buildSearchConditions(search);
      if (searchCondition) {
        whereConditions.push(searchCondition);
      }
    }

    // Apply location filter
    if (location_id) {
      whereConditions.push(eq(coachSchema.location_id, location_id));
    }

    // Apply all where conditions
    if (whereConditions.length > 0) {
      const finalCondition =
        whereConditions.length === 1
          ? whereConditions[0]
          : and(...whereConditions);
      baseQuery.where(finalCondition);
      countQuery.where(finalCondition);
    }

    // Apply optimized sorting with proper indexing
    if (sort_by === 'created_at') {
      baseQuery.orderBy(
        sort_order === 'asc'
          ? asc(coachSchema.created_at)
          : desc(coachSchema.created_at)
      );
    } else if (sort_by === 'name') {
      baseQuery.orderBy(
        sort_order === 'asc'
          ? asc(userSchema.first_name)
          : desc(userSchema.first_name)
      );
    }

    // Apply pagination
    baseQuery.offset(offset).limit(limit);

    // Execute main queries in parallel
    const [countResult, coaches] = await Promise.all([countQuery, baseQuery]);

    const count = countResult[0]?.count || 0;

    // If no coaches found, return early
    if (coaches.length === 0) {
      return APIResponse.success({
        message: 'No coaches found',
        data: [],
        pagination: {
          count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
        statusCode: 200,
      });
    }

    // Extract coach IDs for batch group fetching (eliminates N+1)
    const coachIds = coaches.map((coach) => coach.id);

    // Fetch all groups for all coaches in a single query
    const groups = await this.dbService.db
      .select({
        coach_id: groupSchema.coach_id,
        id: groupSchema.id,
        name: groupSchema.name,
        description: groupSchema.description,
        min_age: groupSchema.min_age,
        max_age: groupSchema.max_age,
        skill_level: groupSchema.skill_level,
        max_group_size: groupSchema.max_group_size,
        created_at: groupSchema.created_at,
        updated_at: groupSchema.updated_at,
      })
      .from(groupSchema)
      .where(inArray(groupSchema.coach_id, coachIds));

    // Group groups by coach_id for efficient lookup
    const groupsByCoachId = groups.reduce(
      (acc, group) => {
        if (group.coach_id && !acc[group.coach_id]) {
          acc[group.coach_id] = [];
        }
        if (group.coach_id) {
          acc[group.coach_id].push({
            id: group.id,
            name: group.name,
            description: group.description,
            min_age: group.min_age,
            max_age: group.max_age,
            skill_level: group.skill_level,
            max_group_size: group.max_group_size,
            created_at: group.created_at,
            updated_at: group.updated_at,
          });
        }
        return acc;
      },
      {} as Record<
        number,
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
      >
    );

    // Combine coaches with their groups and optimize photo URL processing
    const resultsWithPhotoUrl = coaches.map((coach) => ({
      ...coach,
      groups: groupsByCoachId[coach.id] || [],
      user: {
        ...coach.user,
        photo_url: coach.user?.photo_url
          ? this.fileStorageService.getAbsoluteUrl(coach.user.photo_url)
          : coach.user?.photo_url,
      },
    }));

    return APIResponse.success<CoachWithUserAndLocationGroup[]>({
      message: 'Coaches retrieved successfully',
      data: resultsWithPhotoUrl,
      pagination: {
        count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
      statusCode: 200,
    });
  }

  /**
   * Optimized findOne method - eliminates N+1 with separate group query
   */
  async findOne(
    id: number
  ): Promise<APIResponse<CoachWithUserAndLocationGroup | undefined>> {
    try {
      // Fetch coach data without groups first
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
        })
        .from(coachSchema)
        .innerJoin(userSchema, eq(coachSchema.user_id, userSchema.id))
        .leftJoin(
          locationSchema,
          eq(coachSchema.location_id, locationSchema.id)
        )
        .where(eq(coachSchema.id, id))
        .limit(1);

      if (coach.length === 0) {
        throw new NotFoundException('Coach not found');
      }

      // Fetch groups for this coach in a separate query (no N+1)
      const groups = await this.dbService.db
        .select({
          id: groupSchema.id,
          name: groupSchema.name,
          description: groupSchema.description,
          min_age: groupSchema.min_age,
          max_age: groupSchema.max_age,
          skill_level: groupSchema.skill_level,
          max_group_size: groupSchema.max_group_size,
          created_at: groupSchema.created_at,
          updated_at: groupSchema.updated_at,
        })
        .from(groupSchema)
        .where(eq(groupSchema.coach_id, id));

      const coachWithPhotoUrl = {
        ...coach[0],
        groups,
        user: {
          ...coach[0].user,
          photo_url: coach[0].user?.photo_url
            ? this.fileStorageService.getAbsoluteUrl(coach[0].user.photo_url)
            : coach[0].user?.photo_url,
        },
      };

      return APIResponse.success({
        message: 'Coach retrieved successfully',
        data: coachWithPhotoUrl,
        statusCode: 200,
      });
    } catch (error) {
      this.logger.error(`Failed to find coach: ${(error as Error).message}`);
      return APIResponse.error<undefined>({
        message: 'Failed to find coach',
        statusCode: 500,
      });
    }
  }

  async update(
    id: number,
    updateCoachDto: UpdateCoachDto,
    photo_url?: Express.Multer.File
  ): Promise<APIResponse<CoachWithUserAndLocationGroup | undefined>> {
    try {
      const coach = await this.findOne(id);

      if (!coach.data) {
        return APIResponse.error<undefined>({
          message: 'Coach not found',
          statusCode: 404,
        });
      }

      if (coach.data) {
        const user = await this.userService.findOne(coach.data.user.id!);
        if (!user) {
          return APIResponse.error<undefined>({
            message: 'User not found',
            statusCode: 404,
          });
        }

        if (user) {
          await this.userService.update(user.id, updateCoachDto, photo_url);
        }
        await this.dbService.db
          .update(coachSchema)
          .set({
            location_id: updateCoachDto.location_id,
            updated_at: new Date(),
          })
          .where(eq(coachSchema.id, id));
      }
      this.logger.log(`Coach updated successfully with ID: ${id}`);

      return APIResponse.success({
        message: 'Coach updated successfully',
        data: coach.data,
        statusCode: 200,
      });
    } catch (error) {
      this.logger.error(`Failed to update coach: ${(error as Error).message}`);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const coach = await this.findOne(id);

      if (!coach.data) {
        return APIResponse.error<undefined>({
          message: 'Coach not found',
          statusCode: 404,
        });
      }

      if (coach.data.user.id) {
        await this.userService.remove(coach.data.user.id);
      }

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
