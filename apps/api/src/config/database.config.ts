import { ConfigService } from '@nestjs/config';

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  url: string;
  pool: {
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
  };
  ssl: boolean | { rejectUnauthorized: boolean };
}

/**
 * Get database configuration from environment variables
 */
export function getDatabaseConfig(
  configService: ConfigService
): DatabaseConfig {
  const databaseUrl = configService.get<string>('DATABASE_URL');

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  return {
    url: databaseUrl,
    pool: {
      max: parseInt(configService.get<string>('DB_POOL_MAX', '20')),
      idleTimeoutMillis: parseInt(
        configService.get<string>('DB_POOL_IDLE_TIMEOUT', '30000')
      ),
      connectionTimeoutMillis: parseInt(
        configService.get<string>('DB_POOL_CONNECTION_TIMEOUT', '2000')
      ),
    },
    ssl: false,
  };
}
