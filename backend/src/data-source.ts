import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// Load the right .env file depending on NODE_ENV
dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
});
dotenv.config({ path: '.env' }); // fallback

const isProd = process.env.NODE_ENV === 'production';
const databaseUrl = process.env.DATABASE_URL;

/**
 * TypeORM DataSource for CLI commands (migrations, schema generation).
 *
 * Usage:
 *   npm run migration:generate  — generate a new migration
 *   npm run migration:run       — apply pending migrations (production)
 *   npm run migration:revert    — revert the last migration
 */
export const AppDataSource = new DataSource(
  isProd && databaseUrl
    ? {
        type: 'postgres',
        url: databaseUrl,
        ssl: { rejectUnauthorized: false },
        entities: ['dist/**/*.entity.js'],
        migrations: ['dist/migrations/*.js'],
        migrationsTableName: 'typeorm_migrations',
        synchronize: false,
        logging: false,
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'karkachi_phone',
        entities: ['src/**/*.entity.ts'],
        migrations: ['src/migrations/*.ts'],
        migrationsTableName: 'typeorm_migrations',
        synchronize: false,
        logging: true,
      },
);
