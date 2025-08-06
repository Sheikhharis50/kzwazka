import { JwtService } from '@nestjs/jwt';
import { randomBytes, createHash } from 'crypto';

/**
 * Generate a JWT token for a user
 * Only includes user ID in the payload for security
 */
export const generateToken = (
  jwtService: JwtService,
  userId: string
): string => {
  const payload = {
    sub: userId,
  };

  return jwtService.sign(payload);
};

/**
 * Generate a secure random token for password reset
 * Uses cryptographically secure random bytes
 */
export const generatePasswordResetToken = (): string => {
  // Generate 32 random bytes and convert to hex string
  return randomBytes(32).toString('hex');
};

/**
 * Generate a hash of the reset token for secure storage
 * This prevents token exposure if database is compromised
 */
export const hashResetToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};

/**
 * Verify a reset token against its hash
 */
export const verifyResetToken = (token: string, hash: string): boolean => {
  const tokenHash = hashResetToken(token);
  return tokenHash === hash;
};

/**
 * Generate a reset URL with the token
 * Uses FRONTEND_URL from environment variables
 */
export const generateResetUrl = (token: string): string => {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  return `${baseUrl}/reset-password?token=${token}`;
};

/**
 * Check if a reset token has expired
 * Tokens expire after 1 hour (3600000 milliseconds)
 */
export const isResetTokenExpired = (createdAt: Date): boolean => {
  const now = new Date();
  const tokenAge = now.getTime() - createdAt.getTime();
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

  return tokenAge > oneHour;
};
