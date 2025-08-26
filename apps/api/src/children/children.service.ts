import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import {
  CreateChildrenDto,
  CreateChildrenDtoByAdmin,
} from './dto/create-children.dto';
import { UpdateChildrenDto } from './dto/update-children.dto';
import { QueryChildrenDto } from './dto/query-children.dto';
import { DatabaseService } from '../db/drizzle.service';
import { eq, sql } from 'drizzle-orm';
import {
  childrenSchema,
  userSchema,
  locationSchema,
  childrenGroupSchema,
} from '../db/schemas';
import { APP_CONSTANTS } from '../utils/constants';
import { getPageOffset } from '../utils/pagination';
import * as bcrypt from 'bcryptjs';
import { EmailService } from '../services/email.service';
import { generateToken } from '../utils/auth.utils';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ChildrenService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService
  ) {}

  async create(body: CreateChildrenDto) {
    // Check if user already exists
    const existingUser = await this.dbService.db
      .select({ id: userSchema.id })
      .from(userSchema)
      .where(eq(userSchema.email, body.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password if provided
    let hashedPassword: string | null = null;
    if (body.password) {
      hashedPassword = await bcrypt.hash(body.password, 10);
    }

    // Use transaction to create both user and children
    try {
      return await this.dbService.db.transaction(async (tx) => {
        // Create user first
        const [newUser] = await tx
          .insert(userSchema)
          .values({
            email: body.email,
            first_name: body.first_name,
            last_name: body.last_name,
            phone: body.phone,
            password: hashedPassword,
            role_id: body.role_id,
            is_active: body.is_active ?? true,
            is_verified: body.is_verified ?? false,
            google_social_id: body.google_social_id,
            photo_url: body.photo_url,
          })
          .returning();

        // Create children record
        const [newChildren] = await tx
          .insert(childrenSchema)
          .values({
            user_id: newUser.id,
            dob: new Date(body.dob).toISOString(),
            parent_first_name: body.parent_first_name,
            parent_last_name: body.parent_last_name,
            location_id: body.location_id,
          })
          .returning();

        return {
          user: newUser,
          children: newChildren,
        };
      });
    } catch (error) {
      // If transaction fails, throw a more specific error
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(
        `Failed to create user and children: ${(error as Error).message}`
      );
    }
  }

  async createdByAdmin(body: CreateChildrenDtoByAdmin) {
    const { group_id, ...rest } = body;
    const first_name = rest.name;
    const parent_first_name = rest.parent_name;
    const children = await this.create({
      ...rest,
      first_name,
      parent_first_name,
    });
    if (group_id) {
      await this.assignGroup(children.children.id, group_id);
    }

    const accessToken = generateToken(this.jwtService, children.user.id);

    await this.emailService.sendCreatedChildrenEmailByAdmin(
      children.user.email,
      children.user.first_name,
      `${process.env.NEXT_PUBLIC_APP_URL}/register/?token=${accessToken}`
    );
    return children;
  }

  async count() {
    const [{ count }] = await this.dbService.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(childrenSchema)
      .limit(1);
    return count;
  }

  async assignGroup(childrenId: number, groupId: number) {
    const updatedChildren = await this.dbService.db
      .insert(childrenGroupSchema)
      .values({
        children_id: childrenId,
        group_id: groupId,
      })
      .returning();

    if (updatedChildren.length === 0) {
      throw new NotFoundException('Children not found');
    }

    return updatedChildren[0];
  }

  async findAll(params: QueryChildrenDto) {
    const {
      page = '1',
      limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString(),
      search,
      location_id,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = params;

    const offset = getPageOffset(page.toString(), limit.toString());

    // Build the base query
    const baseQuery = this.dbService.db
      .select({
        id: childrenSchema.id,
        dob: childrenSchema.dob,
        parent_first_name: childrenSchema.parent_first_name,
        parent_last_name: childrenSchema.parent_last_name,
        created_at: childrenSchema.created_at,
        updated_at: childrenSchema.updated_at,
        user: {
          id: userSchema.id,
          first_name: userSchema.first_name,
          last_name: userSchema.last_name,
          email: userSchema.email,
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
      .from(childrenSchema)
      .leftJoin(userSchema, eq(childrenSchema.user_id, userSchema.id))
      .leftJoin(
        locationSchema,
        eq(childrenSchema.location_id, locationSchema.id)
      );

    // Build count query
    const countQuery = this.dbService.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(childrenSchema)
      .leftJoin(userSchema, eq(childrenSchema.user_id, userSchema.id))
      .leftJoin(
        locationSchema,
        eq(childrenSchema.location_id, locationSchema.id)
      );

    // Apply search filter
    if (search) {
      const searchCondition = sql`(${userSchema.first_name} ILIKE ${`%${search}%`} OR ${userSchema.last_name} ILIKE ${`%${search}%`} OR ${childrenSchema.parent_first_name} ILIKE ${`%${search}%`} OR ${childrenSchema.parent_last_name} ILIKE ${`%${search}%`})`;
      baseQuery.where(searchCondition);
      countQuery.where(searchCondition);
    }

    // Apply location filter
    if (location_id) {
      baseQuery.where(eq(childrenSchema.location_id, location_id));
      countQuery.where(eq(childrenSchema.location_id, location_id));
    }

    // Apply sorting
    if (sort_by === 'created_at') {
      baseQuery.orderBy(
        sort_order === 'asc'
          ? childrenSchema.created_at
          : sql`${childrenSchema.created_at} DESC`
      );
    } else if (sort_by === 'dob') {
      baseQuery.orderBy(
        sort_order === 'asc'
          ? childrenSchema.dob
          : sql`${childrenSchema.dob} DESC`
      );
    }

    // Apply pagination
    baseQuery.offset(offset).limit(Number(limit));

    // Execute both queries
    const [countResult, results] = await Promise.all([
      countQuery.limit(1),
      baseQuery,
    ]);

    const count = countResult[0]?.count || 0;

    return {
      message: 'Children records',
      data: results,
      page,
      limit,
      count,
    };
  }

  async findOne(id: number) {
    const children = await this.dbService.db
      .select({
        id: childrenSchema.id,
        dob: childrenSchema.dob,
        parent_first_name: childrenSchema.parent_first_name,
        parent_last_name: childrenSchema.parent_last_name,
        created_at: childrenSchema.created_at,
        updated_at: childrenSchema.updated_at,
        user: {
          id: userSchema.id,
          first_name: userSchema.first_name,
          last_name: userSchema.last_name,
          email: userSchema.email,
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
      .from(childrenSchema)
      .leftJoin(userSchema, eq(childrenSchema.user_id, userSchema.id))
      .leftJoin(
        locationSchema,
        eq(childrenSchema.location_id, locationSchema.id)
      )
      .where(eq(childrenSchema.id, id))
      .limit(1);

    if (children.length === 0) {
      throw new NotFoundException('Children not found');
    }

    return {
      message: 'Children record',
      data: children[0],
    };
  }

  async findByUserId(userId: number) {
    return await this.dbService.db
      .select({
        id: childrenSchema.id,
        dob: childrenSchema.dob,
        parent_first_name: childrenSchema.parent_first_name,
        parent_last_name: childrenSchema.parent_last_name,
        created_at: childrenSchema.created_at,
        updated_at: childrenSchema.updated_at,
        user: {
          id: userSchema.id,
          first_name: userSchema.first_name,
          last_name: userSchema.last_name,
          email: userSchema.email,
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
      .from(childrenSchema)
      .leftJoin(userSchema, eq(childrenSchema.user_id, userSchema.id))
      .leftJoin(
        locationSchema,
        eq(childrenSchema.location_id, locationSchema.id)
      )
      .where(eq(childrenSchema.user_id, userId));
  }

  async update(id: number, updateChildrenDto: UpdateChildrenDto) {
    const updateValues = {
      ...updateChildrenDto,
      ...(updateChildrenDto.dob && {
        dob: new Date(updateChildrenDto.dob).toISOString(),
      }),
      updated_at: new Date(),
    };

    const updatedChildren = await this.dbService.db
      .update(childrenSchema)
      .set(updateValues)
      .where(eq(childrenSchema.id, id))
      .returning();

    if (updatedChildren.length === 0) {
      throw new NotFoundException('Children not found');
    }

    return {
      message: 'Children updated successfully',
      data: updatedChildren[0],
    };
  }

  async remove(id: number) {
    const deletedChildren = await this.dbService.db
      .delete(childrenSchema)
      .where(eq(childrenSchema.id, id))
      .returning();

    if (deletedChildren.length === 0) {
      throw new NotFoundException('Children not found');
    }

    return {
      message: 'Children deleted successfully',
    };
  }

  async updatePhotoUrl(id: number) {
    const updatedChildren = await this.dbService.db
      .update(childrenSchema)
      .set({
        updated_at: new Date(),
      })
      .where(eq(childrenSchema.id, id))
      .returning();

    if (updatedChildren.length === 0) {
      throw new NotFoundException('Children not found');
    }

    return {
      message: 'Photo URL updated successfully',
      data: updatedChildren[0],
    };
  }

  async assignLocation(childrenId: number, locationId: number) {
    const updatedChildren = await this.dbService.db
      .update(childrenSchema)
      .set({
        location_id: locationId,
        updated_at: new Date(),
      })
      .where(eq(childrenSchema.id, childrenId))
      .returning();

    if (updatedChildren.length === 0) {
      throw new NotFoundException('Children not found');
    }

    return {
      message: 'Location assigned successfully',
      data: updatedChildren[0],
    };
  }
}
