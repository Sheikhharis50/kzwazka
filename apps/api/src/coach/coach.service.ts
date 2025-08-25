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

@Injectable()
export class CoachService {
  private readonly logger = new Logger(CoachService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly userService: UserService
  ) {}

  async create(createCoachDto: CreateCoachDto) {
    try {
      // Check if coach with this email already exists
      const existingCoach = await this.dbService.db
        .select()
        .from(coachSchema)
        .where(eq(coachSchema.email, createCoachDto.email))
        .limit(1);

      if (existingCoach.length > 0) {
        throw new ConflictException('Coach with this email already exists');
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
      });

      // Create coach record
      const newCoach = await this.dbService.db
        .insert(coachSchema)
        .values({
          user_id: newUser.id,
          name: `${createCoachDto.first_name} ${createCoachDto.last_name}`,
          email: createCoachDto.email,
          phone: createCoachDto.phone,
          status: true,
          location_id: createCoachDto.location_id,
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
            role: coachRole.name,
          },
        },
      };
    } catch (error) {
      this.logger.error(`Failed to create coach: ${error.message}`);
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

  async findAll(params: { page: string; limit: string }) {
    const {
      page = '1',
      limit = APP_CONSTANTS.PAGINATION.DEFAULT_LIMIT.toString(),
    } = params;

    const offset = getPageOffset(page, limit);

    const [count, results] = await Promise.all([
      this.count(),
      this.dbService.db
        .select({
          id: coachSchema.id,
          name: coachSchema.name,
          email: coachSchema.email,
          phone: coachSchema.phone,
          status: coachSchema.status,
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
        .leftJoin(
          locationSchema,
          eq(coachSchema.location_id, locationSchema.id)
        )
        .offset(offset)
        .limit(Number(limit)),
    ]);

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
        name: coachSchema.name,
        email: coachSchema.email,
        phone: coachSchema.phone,
        status: coachSchema.status,
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
        .from(coachSchema)
        .where(eq(coachSchema.id, id))
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
          .from(coachSchema)
          .where(eq(coachSchema.email, updateCoachDto.email))
          .limit(1);

        if (emailConflict.length > 0) {
          throw new ConflictException('Coach with this email already exists');
        }
      }

      // Prepare update data with proper type conversion
      const updateData: Partial<Coach> = {};
      if (updateCoachDto.first_name)
        updateData.name = `${updateCoachDto.first_name} ${updateCoachDto.last_name}`;
      if (updateCoachDto.last_name)
        updateData.name = `${updateCoachDto.first_name} ${updateCoachDto.last_name}`;
      if (updateCoachDto.email) updateData.email = updateCoachDto.email;
      if (updateCoachDto.phone) updateData.phone = updateCoachDto.phone;
      if (updateCoachDto.location_id)
        updateData.location_id = updateCoachDto.location_id;
      updateData.status = true;

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
      this.logger.error(`Failed to update coach: ${error.message}`);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      // Check if coach exists
      const existingCoach = await this.dbService.db
        .select()
        .from(coachSchema)
        .where(eq(coachSchema.id, id))
        .limit(1);

      if (existingCoach.length === 0) {
        throw new NotFoundException('Coach not found');
      }

      // Delete coach record
      const deletedCoach = await this.dbService.db
        .delete(coachSchema)
        .where(eq(coachSchema.id, id))
        .returning();

      // Note: User record is not automatically deleted to preserve data integrity
      // You may want to implement a soft delete or handle user deletion separately

      this.logger.log(`Coach deleted successfully with ID: ${id}`);

      return {
        message: 'Coach deleted successfully',
        data: deletedCoach[0],
      };
    } catch (error) {
      this.logger.error(`Failed to delete coach: ${error.message}`);
      throw error;
    }
  }

  async updateStatus(id: number, status: boolean) {
    try {
      const updatedCoach = await this.dbService.db
        .update(coachSchema)
        .set({
          status,
          updated_at: new Date(),
        })
        .where(eq(coachSchema.id, id))
        .returning();

      if (updatedCoach.length === 0) {
        throw new NotFoundException('Coach not found');
      }

      this.logger.log(`Coach status updated successfully with ID: ${id}`);

      return {
        message: 'Coach status updated successfully',
        data: updatedCoach[0],
      };
    } catch (error) {
      this.logger.error(`Failed to update coach status: ${error.message}`);
      throw error;
    }
  }
}
