import { MigrationInterface, QueryRunner } from "typeorm";

// Leftover from the Prisma → TypeORM switch: Prisma created these columns
// with slightly different (but equivalent) defaults. This aligns them with
// the entities, so future generated migrations only contain real changes.
export class SyncDefaultsWithTypeORM1790846527719 implements MigrationInterface {
    name = 'SyncDefaultsWithTypeORM1790846527719'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin_users" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "admin_users" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "itinerary_days" ALTER COLUMN "activities" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "inquiries" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "booking_requests" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "booking_requests" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "highlights" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "inclusions" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "exclusions" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "requirements" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "images" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "destinations" ALTER COLUMN "attractions" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "destinations" ALTER COLUMN "activities" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "destinations" ALTER COLUMN "images" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "destinations" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "destinations" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "testimonials" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "blog_posts" ALTER COLUMN "tags" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "blog_posts" ALTER COLUMN "createdAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "blog_posts" ALTER COLUMN "updatedAt" SET DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blog_posts" ALTER COLUMN "updatedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "blog_posts" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "blog_posts" ALTER COLUMN "tags" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "testimonials" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "destinations" ALTER COLUMN "updatedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "destinations" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "destinations" ALTER COLUMN "images" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "destinations" ALTER COLUMN "activities" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "destinations" ALTER COLUMN "attractions" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "updatedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "images" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "requirements" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "exclusions" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "inclusions" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "tours" ALTER COLUMN "highlights" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "booking_requests" ALTER COLUMN "updatedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "booking_requests" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "inquiries" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "itinerary_days" ALTER COLUMN "activities" SET DEFAULT ARRAY[]::text[]`);
        await queryRunner.query(`ALTER TABLE "admin_users" ALTER COLUMN "updatedAt" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "admin_users" ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP`);
    }

}
