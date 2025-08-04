import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schemas';

@Injectable()
export class DatabaseService {
  public db: ReturnType<typeof drizzle>;

  constructor() {
    // Using explicit connection parameters to avoid defaulting to system username
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: 'postgres', // Explicitly set the PostgreSQL username
      password: '1234',  // Explicitly set the PostgreSQL password
      database: process.env.DB_NAME || 'kzwazka',
    });
    
    this.db = drizzle(pool, { schema });
  }
}