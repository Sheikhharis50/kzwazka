import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import {
  CreateChildrenDto,
  CreateChildrenDtoByAdmin,
} from './dto/create-children.dto';
import { UpdateChildrenDto } from './dto/update-children.dto';
import { QueryChildrenDto } from './dto/query-children.dto';
import { DatabaseService } from '../db/drizzle.service';
import { eq, sql, and, or, ilike, desc, asc, SQL } from 'drizzle-orm';
import { childrenSchema, userSchema, groupSchema } from '../db/schemas';
import { APP_CONSTANTS } from '../utils/constants';
import { getPageOffset } from '../utils/pagination';
import * as bcrypt from 'bcryptjs';
import { EmailService } from '../services/email.service';
import { generateToken } from '../utils/auth.utils';
import { JwtService } from '@nestjs/jwt';
import { FileStorageService } from '../services';
import { UserService } from '../user/user.service';
import { APIResponse } from 'src/utils/response';
import { IChildrenResponse } from './children.types';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class ChildrenService {
  private readonly logger = new Logger(ChildrenService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly fileStorageService: FileStorageService,
    private readonly userService: UserService,
    @Inject(forwardRef(() => PaymentService))
    private readonly stripeService: PaymentService
  ) {}

  async create(body: CreateChildrenDto) {
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(body.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const childrenRole = await this.userService.getRoleByName('children');
    if (!childrenRole)
      throw new Error('Child role not found. Please seed the database.');

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
            last_name: body.last_name || '',
            phone: body.phone,
            password: hashedPassword,
            role_id: childrenRole.id,
            is_active: body.is_active ?? true,
            is_verified: body.is_verified ?? false,
            google_social_id: body.google_social_id || null,
            photo_url: body.photo_url,
          })
          .returning();

        const customer = await this.stripeService.createCustomer(
          body.email,
          `${body.first_name} ${body.last_name}`,
          body.phone,
          {
            user_id: newUser.id.toString(),
            dob: body.dob,
            google_social_id: body.google_social_id || '',
          }
        );
        console.log(customer);
        const [newChildren] = await tx
          .insert(childrenSchema)
          .values({
            user_id: newUser.id,
            dob: new Date(body.dob).toISOString(),
            parent_first_name: body.parent_first_name || '',
            parent_last_name: body.parent_last_name || '',
            external_id: customer.id,
          })
          .returning();

        return {
          user: newUser,
          children: newChildren,
        };
      });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new Error(
        `Failed to create user and children: ${(error as Error).message}`
      );
    }
  }

  async createdByAdmin(
    body: CreateChildrenDtoByAdmin,
    photo_url?: Express.Multer.File
  ) {
    const { ...rest } = body;
    const first_name = rest.name;
    const parent_first_name = rest.parent_name;

    const children = await this.create({
      ...rest,
      first_name,
      parent_first_name,
    });
    if (photo_url) {
      await this.userService.updatePhotoUrl(children.user.id, photo_url);
    }

    const accessToken = generateToken(this.jwtService, children.user.id);

    await this.emailService.sendCreatedChildrenEmailByAdmin(
      children.user.email,
      children.user.first_name,
      `${process.env.NEXT_PUBLIC_APP_URL}/register/?token=${accessToken}`
    );
    return children;
  }

  /**
   * Optimized count method - uses simple COUNT without unnecessary joins
   */
  async count() {
    const [{ count }] = await this.dbService.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(childrenSchema);
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

    // Single word search - search in first_name, last_name, parent names, or email
    if (searchWords.length === 1) {
      const word = `%${searchWords[0]}%`;
      conditions.push(
        or(
          ilike(userSchema.first_name, word),
          ilike(userSchema.last_name, word),
          ilike(userSchema.email, word),
          ilike(childrenSchema.parent_first_name, word),
          ilike(childrenSchema.parent_last_name, word)
        )!
      );
    } else {
      // Multiple words - try different combinations
      const firstWord = `%${searchWords[0]}%`;
      const lastWord = `%${searchWords[searchWords.length - 1]}%`;
      const fullSearch = `%${normalizedSearch}%`;

      // Search for full term in child's first_name or last_name
      conditions.push(
        or(
          ilike(userSchema.first_name, fullSearch),
          ilike(userSchema.last_name, fullSearch)
        )!
      );

      // Search for full term in parent's first_name or last_name
      conditions.push(
        or(
          ilike(childrenSchema.parent_first_name, fullSearch),
          ilike(childrenSchema.parent_last_name, fullSearch)
        )!
      );

      // Search for first word in child's first_name and last word in child's last_name
      conditions.push(
        and(
          ilike(userSchema.first_name, firstWord),
          ilike(userSchema.last_name, lastWord)
        )!
      );

      // Search for first word in parent's first_name and last word in parent's last_name
      conditions.push(
        and(
          ilike(childrenSchema.parent_first_name, firstWord),
          ilike(childrenSchema.parent_last_name, lastWord)
        )!
      );

      // Search for first word in child's first_name and last word in parent's last_name
      conditions.push(
        and(
          ilike(userSchema.first_name, firstWord),
          ilike(childrenSchema.parent_last_name, lastWord)
        )!
      );

      // Search for first word in parent's first_name and last word in child's last_name
      conditions.push(
        and(
          ilike(childrenSchema.parent_first_name, firstWord),
          ilike(userSchema.last_name, lastWord)
        )!
      );
    }

    return or(...conditions)!;
  }

  /**
   * Optimized findAll method with improved search and performance
   */
  async findAll(
    params: QueryChildrenDto
  ): Promise<APIResponse<IChildrenResponse[]>> {
    const {
      page = '1',
      limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString(),
      search,
      group_id,
      sort_by = 'created_at',
      sort_order = 'desc',
    } = params;

    const offset = getPageOffset(page.toString(), limit.toString());

    // Build optimized base query
    const baseQuery = this.dbService.db
      .select({
        id: childrenSchema.id,
        dob: childrenSchema.dob,
        parent_first_name: childrenSchema.parent_first_name,
        parent_last_name: childrenSchema.parent_last_name,
        external_id: childrenSchema.external_id,
        created_at: childrenSchema.created_at,
        updated_at: childrenSchema.updated_at,
        user: {
          id: userSchema.id,
          first_name: userSchema.first_name,
          last_name: userSchema.last_name,
          email: userSchema.email,
          photo_url: userSchema.photo_url,
          phone: userSchema.phone,
        },
        group: {
          id: groupSchema.id,
          name: groupSchema.name,
        },
      })
      .from(childrenSchema)
      .innerJoin(userSchema, eq(childrenSchema.user_id, userSchema.id))
      .leftJoin(groupSchema, eq(childrenSchema.group_id, groupSchema.id));

    // Build optimized count query
    const countQuery = this.dbService.db
      .select({ count: sql<number>`COUNT(*)` })
      .from(childrenSchema)
      .innerJoin(userSchema, eq(childrenSchema.user_id, userSchema.id))
      .leftJoin(groupSchema, eq(childrenSchema.group_id, groupSchema.id));

    // Build where conditions array
    const whereConditions: SQL[] = [];

    // Apply search filter with improved logic
    if (search) {
      const searchCondition = this.buildSearchConditions(search);
      if (searchCondition) {
        whereConditions.push(searchCondition);
      }
    }

    // Apply group filter
    if (group_id) {
      whereConditions.push(eq(childrenSchema.group_id, group_id));
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

    // Apply optimized sorting
    if (sort_by === 'created_at') {
      baseQuery.orderBy(
        sort_order === 'asc'
          ? asc(childrenSchema.created_at)
          : desc(childrenSchema.created_at)
      );
    } else if (sort_by === 'dob') {
      baseQuery.orderBy(
        sort_order === 'asc'
          ? asc(childrenSchema.dob)
          : desc(childrenSchema.dob)
      );
    } else if (sort_by === 'name') {
      baseQuery.orderBy(
        sort_order === 'asc'
          ? asc(userSchema.first_name)
          : desc(userSchema.first_name)
      );
    }

    // Apply pagination
    baseQuery.offset(offset).limit(Number(limit));

    // Execute queries in parallel
    const [countResult, results] = await Promise.all([countQuery, baseQuery]);

    const count = countResult[0]?.count || 0;

    // Optimize photo URL processing
    const resultsWithPhotoUrl = results.map((child) => ({
      ...child,
      user: {
        ...child.user,
        photo_url: child.user?.photo_url
          ? this.fileStorageService.getAbsoluteUrl(child.user.photo_url)
          : child.user?.photo_url,
      },
    }));

    return APIResponse.success<IChildrenResponse[]>({
      message: 'Children records fetched successfully',
      data: resultsWithPhotoUrl,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        count,
        totalPages: Math.ceil(count / Number(limit)),
      },
      statusCode: 200,
    });
  }

  /**
   * Optimized findOne method
   */
  async findOne(id: number): Promise<APIResponse<IChildrenResponse>> {
    const children = await this.dbService.db
      .select({
        id: childrenSchema.id,
        dob: childrenSchema.dob,
        parent_first_name: childrenSchema.parent_first_name,
        parent_last_name: childrenSchema.parent_last_name,
        created_at: childrenSchema.created_at,
        updated_at: childrenSchema.updated_at,
        external_id: childrenSchema.external_id,
        user: {
          id: userSchema.id,
          first_name: userSchema.first_name,
          last_name: userSchema.last_name,
          email: userSchema.email,
          photo_url: userSchema.photo_url,
          phone: userSchema.phone,
        },
        group: {
          id: groupSchema.id,
          name: groupSchema.name,
        },
      })
      .from(childrenSchema)
      .innerJoin(userSchema, eq(childrenSchema.user_id, userSchema.id))
      .leftJoin(groupSchema, eq(childrenSchema.group_id, groupSchema.id))
      .where(eq(childrenSchema.id, id))
      .limit(1);

    if (children.length === 0) {
      throw new NotFoundException('Children not found');
    }

    const childrenWithPhotoUrl = {
      ...children[0],
      user: {
        ...children[0].user,
        photo_url: children[0].user?.photo_url
          ? this.fileStorageService.getAbsoluteUrl(children[0].user.photo_url)
          : children[0].user?.photo_url,
      },
    };

    return APIResponse.success<IChildrenResponse>({
      message: 'Children record fetched successfully',
      data: childrenWithPhotoUrl,
      statusCode: 200,
    });
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
        group: {
          id: groupSchema.id,
          name: groupSchema.name,
        },
      })
      .from(childrenSchema)
      .leftJoin(userSchema, eq(childrenSchema.user_id, userSchema.id))
      .leftJoin(groupSchema, eq(childrenSchema.group_id, groupSchema.id))
      .where(eq(childrenSchema.user_id, userId));
  }

  async update(
    id: number,
    updateChildrenDto: UpdateChildrenDto,
    photo_url?: Express.Multer.File
  ): Promise<APIResponse<IChildrenResponse | undefined>> {
    const updateValues = {
      ...updateChildrenDto,
      ...(updateChildrenDto.dob && {
        dob: new Date(updateChildrenDto.dob).toISOString(),
      }),
      updated_at: new Date(),
    };
    const children = await this.findOne(id);

    if (children.data) {
      const user = await this.userService.findOne(children.data.user.id);
      if (!user) {
        return APIResponse.error<undefined>({
          message: 'User not found',
          statusCode: 404,
        });
      }
      await this.userService.update(
        children.data.user.id,
        updateValues,
        photo_url
      );
      await this.dbService.db
        .update(childrenSchema)
        .set(updateValues)
        .where(eq(childrenSchema.id, children.data.id))
        .returning();

      return APIResponse.success<IChildrenResponse>({
        message: 'Children updated successfully',
        data: children.data,
        statusCode: 200,
      });
    }
    return APIResponse.error<undefined>({
      message: 'Children not found',
      statusCode: 404,
    });
  }

  async remove(
    id: number
  ): Promise<APIResponse<IChildrenResponse | undefined>> {
    const children = await this.findOne(id);

    if (children.data) {
      const user = await this.userService.findOne(children.data.user.id);
      if (!user) {
        return APIResponse.error<undefined>({
          message: 'User not found',
          statusCode: 404,
        });
      }
      await this.userService.remove(children.data.user.id);
      await this.dbService.db
        .delete(childrenSchema)
        .where(eq(childrenSchema.id, children.data.id));

      return APIResponse.success<IChildrenResponse>({
        message: 'Children deleted successfully',
        data: children.data,
        statusCode: 200,
      });
    }
    return APIResponse.error<undefined>({
      message: 'Children not found',
      statusCode: 404,
    });
  }

  async calculateChildrenAge(id: number) {
    const children = await this.findOne(id);
    if (!children.data) {
      throw new NotFoundException('Children not found');
    }
    const dob = new Date(children.data.dob);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    return age;
  }
}
