import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { DrizzleService } from 'src/db/drizzle.service';
import { eq } from 'drizzle-orm';
import { roleSchema, userSchema } from 'src/db/schemas';

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

/**
 * Verify if a password matches the hashed version
 */
export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Get the child role ID from the database
 */
export const getChildRoleId = async (drizzle: DrizzleService) => {
  const childRole = await drizzle.db
    .select()
    .from(roleSchema)
    .where(eq(roleSchema.name, 'child'))
    .limit(1);

  if (childRole.length === 0) {
    throw new Error('Child role not found. Please seed the database.');
  }

  return childRole[0];
};

/**
 * Check if a user exists by email
 */
export const getUserByEmail = async (drizzle: DrizzleService, email: string) => {
  return await drizzle.db
    .select()
    .from(userSchema)
    .where(eq(userSchema.email, email))
    .limit(1);
};

/**
 * Generate a JWT token for a user
 */
export const generateToken = (
  jwtService: JwtService,
  userId: string,
  email: string,
  role: string,
): string => {
  const payload = {
    sub: userId,
    email,
    role,
  };
  
  return jwtService.sign(payload);
};