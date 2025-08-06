import { Injectable, Logger } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schemas';

@Injectable()
export class DatabaseService {
  public db: ReturnType<typeof drizzle>;
  private readonly logger = new Logger(DatabaseService.name);

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      this.logger.error('DATABASE_URL environment variable is not set');
      throw new Error('DATABASE_URL environment variable is required');
    }

    try {
      // Parse DATABASE_URL to extract connection parameters
      const url = new URL(databaseUrl);
      
      const pool = new Pool({
        host: url.hostname,
        port: parseInt(url.port || '5432'),
        user: url.username,
        password: url.password,
        database: url.pathname.length > 1 ? url.pathname.slice(1) : undefined,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        // Connection pool configuration for production
        max: parseInt(process.env.DB_POOL_MAX || '20'),
        idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '30000'),
        connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT || '2000'),
      });

      // Test the connection
      pool.on('connect', () => {
        this.logger.log('Database connection established');
      });

      pool.on('error', (err) => {
        this.logger.error('Database connection error:', err);
      });

      this.db = drizzle(pool, { schema });
      
      this.logger.log('Database service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize database service:', error);
      throw new Error(`Database initialization failed: ${error.message}`);
    }
  }
}