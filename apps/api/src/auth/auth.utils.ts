import { JwtService } from '@nestjs/jwt';

/**
 * Generate a JWT token for a user
 * Only includes user ID in the payload for security
 */
export const generateToken = (
  jwtService: JwtService,
  userId: string,
): string => {
  const payload = {
    sub: userId,
  };
  
  return jwtService.sign(payload);
};