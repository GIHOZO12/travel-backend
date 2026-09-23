-- Convert admin_users.role from a plain String column to a proper enum.
-- Existing rows all already contain the literal text "admin" (the old
-- column's default), which is exactly the enum's ADMIN @map value below —
-- so this is a lossless, data-preserving cast, not a backfill.

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('admin', 'staff');

-- AlterTable
ALTER TABLE "admin_users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "admin_users" ALTER COLUMN "role" TYPE "AdminRole" USING ("role"::"AdminRole");
ALTER TABLE "admin_users" ALTER COLUMN "role" SET DEFAULT 'admin';
