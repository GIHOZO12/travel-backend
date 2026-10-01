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

// One DataSource (connection pool) is shared by the whole app. It's also what
// the TypeORM CLI loads (`-d src/config/data-source.ts`) to generate and run
// migrations — see the migration:* scripts in package.json.
//
// server.ts must call AppDataSource.initialize() before handling requests.
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [AdminUser, Destination, Tour, ItineraryDay, Inquiry, BookingRequest, Faq, Testimonial, BlogPost],
  // .ts when running through tsx (dev / CLI), .js after `npm run build`.
  migrations: [path.join(__dirname, '..', 'migrations', '*.{ts,js}')],
  // Never let TypeORM change the schema on its own — every change goes
  // through a reviewed migration file instead.
  synchronize: false,
  logging: false,
});
