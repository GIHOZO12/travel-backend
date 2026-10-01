import { ColumnOptions } from 'typeorm';

// Column option presets reused across entities, so every table describes
// these the same way (and the same way the existing database already has them).

// Prisma's `String[] @default([])` → a Postgres text[] column defaulting to an
// empty array. Written as '{}' (Postgres's array literal) rather than
// ARRAY[]::text[]: TypeORM reads the latter back from the database as
// "ARRAY[]", never sees a match, and would add it to every generated migration.
export const textArray: ColumnOptions = {
  type: 'text',
  array: true,
  nullable: true,
  default: () => "'{}'",
};

// Prisma's `DateTime` → TIMESTAMP(3) (millisecond precision, no time zone).
export const timestamp: ColumnOptions = { type: 'timestamp', precision: 3 };
