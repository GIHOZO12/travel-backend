import 'reflect-metadata';
import 'dotenv/config';
import path from 'path';
import { DataSource } from 'typeorm';
import { AdminUser } from '../entities/AdminUser';
import { Destination } from '../entities/Destination';
import { Tour } from '../entities/Tour';
import { ItineraryDay } from '../entities/ItineraryDay';
import { Inquiry } from '../entities/Inquiry';
import { BookingRequest } from '../entities/BookingRequest';
import { Faq } from '../entities/Faq';
import { Testimonial } from '../entities/Testimonial';
import { BlogPost } from '../entities/BlogPost';

// Hosted Postgres (Neon, Render Postgres, Supabase, ...) requires an SSL
// connection; a local Postgres on your own machine normally doesn't have SSL
// enabled at all and will reject a client that demands it. Rather than guess
// from NODE_ENV (easy to forget to set correctly on a host), detect it from
// the connection string itself: these providers all put sslmode=require (or
// similar) in the URL they give you. `rejectUnauthorized: false` is the
// standard setting for these providers' certificates from a plain pg client.
const connectionString = process.env.DATABASE_URL || '';
const requiresSsl = /sslmode=require|ssl=true/i.test(connectionString);

// Prints the DB host we're about to connect to (never the password) so a
// "could not connect" log line can actually be diagnosed instead of just
// seen.
try {
  const { hostname, pathname } = new URL(connectionString);
  console.log(`[db] connecting to ${hostname}${pathname} (ssl: ${requiresSsl})`);
} catch {
  console.log('[db] DATABASE_URL is missing or not a valid connection string');
}

// One DataSource (connection pool) is shared by the whole app. It's also what
// the TypeORM CLI loads (`-d src/config/data-source.ts`) to generate and run
// migrations — see the migration:* scripts in package.json.
//
// server.ts must call AppDataSource.initialize() before handling requests.
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: connectionString,
  ssl: requiresSsl ? { rejectUnauthorized: false } : false,
  entities: [AdminUser, Destination, Tour, ItineraryDay, Inquiry, BookingRequest, Faq, Testimonial, BlogPost],
  // .ts when running through tsx (dev / CLI), .js after `npm run build`.
  migrations: [path.join(__dirname, '..', 'migrations', '*.{ts,js}')],
  // Never let TypeORM change the schema on its own — every change goes
  // through a reviewed migration file instead.
  synchronize: false,
  logging: false,
});
