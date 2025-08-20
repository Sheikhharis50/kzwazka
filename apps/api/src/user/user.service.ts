import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DatabaseService } from '../db/drizzle.service';
import { eq } from 'drizzle-orm';
import { userSchema, roleSchema } from '../db/schemas';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(private readonly db: DatabaseService) {}

  async createAdmin(createUserDto: CreateUserDto) {
    const adminRole = await this.getRoleByName('admin');
    if (!adminRole) {
      throw new Error('Admin role not found. Please seed the database.');
    }

    const admin = await this.create({
      ...createUserDto,
      role_id: adminRole.id,
    });
    return {
      message: 'Admin user created successfully',
      data: admin,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const { email, password, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password if provided
    let hashedPassword: string | null = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Create user
    const newUser = await this.db.db
      .insert(userSchema)
      .values({
        email,
        password: hashedPassword,
        ...userData,
        phone: userData.phone,
        is_active: userData.is_active ?? true,
        is_verified: userData.is_verified ?? false,
      })
      .returning();

    return newUser[0];
  }

  async findAll() {
    return await this.db.db
      .select({
        id: userSchema.id,
        email: userSchema.email,
        first_name: userSchema.first_name,
        last_name: userSchema.last_name,
        phone: userSchema.phone,
        is_active: userSchema.is_active,
        is_verified: userSchema.is_verified,
        role_name: roleSchema.name,
        created_at: userSchema.created_at,
        updated_at: userSchema.updated_at,
      })
      .from(userSchema)
      .innerJoin(roleSchema, eq(userSchema.role_id, roleSchema.id));
  }

  async findOne(id: number) {
    const user = await this.db.db
      .select({
        id: userSchema.id,
        email: userSchema.email,
        first_name: userSchema.first_name,
        last_name: userSchema.last_name,
        phone: userSchema.phone,
        is_active: userSchema.is_active,
        is_verified: userSchema.is_verified,
        role_name: roleSchema.name,
        created_at: userSchema.created_at,
        updated_at: userSchema.updated_at,
      })
      .from(userSchema)
      .innerJoin(roleSchema, eq(userSchema.role_id, roleSchema.id))
      .where(eq(userSchema.id, id))
      .limit(1);

    if (user.length === 0) {
      throw new NotFoundException('User not found');
    }

    return user[0];
  }

  async findByEmail(email: string) {
    const user = await this.db.db
      .select()
      .from(userSchema)
      .where(eq(userSchema.email, email))
      .limit(1);

    return user.length > 0 ? user[0] : null;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { password, ...updateData } = updateUserDto;

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updateValues = {
      ...updateData,
      ...(hashedPassword && { password: hashedPassword }),
      updated_at: new Date(),
    };

    const updatedUser = await this.db.db
      .update(userSchema)
      .set(updateValues)
      .where(eq(userSchema.id, id))
      .returning();

    if (updatedUser.length === 0) {
      throw new NotFoundException('User not found');
    }

    return updatedUser[0];
  }

  async remove(id: number) {
    const deletedUser = await this.db.db
      .delete(userSchema)
      .where(eq(userSchema.id, id))
      .returning();

    if (deletedUser.length === 0) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }

  async updateGoogleSocialId(id: number, googleSocialId: string) {
    const updatedUser = await this.db.db
      .update(userSchema)
      .set({
        google_social_id: googleSocialId,
        is_verified: true,
        updated_at: new Date(),
      })
      .where(eq(userSchema.id, id))
      .returning();

    if (updatedUser.length === 0) {
      throw new NotFoundException('User not found');
    }

    return updatedUser[0];
  }

  async verifyPassword(userId: number, password: string): Promise<boolean> {
    const user = await this.db.db
      .select({ password: userSchema.password })
      .from(userSchema)
      .where(eq(userSchema.id, userId))
      .limit(1);

    if (user.length === 0 || !user[0].password) {
      return false;
    }

    return await bcrypt.compare(password, user[0].password);
  }

  async getRoleByName(roleName: string) {
    const role = await this.db.db
      .select()
      .from(roleSchema)
      .where(eq(roleSchema.name, roleName))
      .limit(1);

    return role.length > 0 ? role[0] : null;
  }

  /**
   * Hash a password using bcrypt
   */
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }
}
