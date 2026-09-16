import { PrismaClient } from '@prisma/client';

// One PrismaClient instance is reused across the whole app instead of
// creating a new database connection pool on every request/import.
const prisma = new PrismaClient();

export default prisma;
