import { ConfigService } from '@nestjs/config';
import { getEmailConfig, EmailConfig } from './email.config';

/**
 * Application configuration interface
 */
export interface AppConfig {
  email: EmailConfig;
  frontendUrl: string;
  jwtSecret: string;
  databaseUrl: string;
  googleClientId: string;
  googleClientSecret: string;
  googleCallbackUrl: string;
  port: number;
  nodeEnv: string;
  allowedOrigins: string[];
}

/**
 * Get application configuration
 */
export function getAppConfig(configService: ConfigService): AppConfig {
  const databaseUrl = configService.get<string>('DATABASE_URL');
  const googleClientId = configService.get<string>('GOOGLE_CLIENT_ID');
  const googleClientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
  const jwtSecret = configService.get<string>('JWT_SECRET');
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  const googleCallbackUrl = configService.get<string>('GOOGLE_CALLBACK_URL');
  const port = configService.get<number>('PORT', 8000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const allowedOrigins = configService
    .get<string>('ALLOWED_ORIGINS')
    ?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0) || ['http://localhost:3000'];

  if (
    !databaseUrl ||
    !googleClientId ||
    !googleClientSecret ||
    !jwtSecret ||
    !frontendUrl ||
    !googleCallbackUrl
  ) {
    throw new Error(
      'Missing required application configuration. Please check your environment variables.'
    );
  }

  return {
    email: getEmailConfig(configService),
    frontendUrl,
    jwtSecret,
    databaseUrl,
    googleClientId,
    googleClientSecret,
    googleCallbackUrl,
    port,
    nodeEnv,
    allowedOrigins,
  };
}
