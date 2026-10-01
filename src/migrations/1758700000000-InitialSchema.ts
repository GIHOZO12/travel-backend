import { MigrationInterface, QueryRunner } from 'typeorm';

// The full starting schema: every table, enum, index and foreign key the
// entities in src/entities describe. This is the same database structure the
// project had under Prisma, so existing data stays valid.
//
// If the tables already exist (a database first set up with Prisma), this
// migration does nothing — it's only recorded as "done" so later migrations
// can build on it.
export class InitialSchema1758700000000 implements MigrationInterface {
  name = 'InitialSchema1758700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasTable('admin_users')) {
      return;
    }

    await queryRunner.query(`CREATE TYPE "AdminRole" AS ENUM ('admin', 'staff')`);
    await queryRunner.query(`CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED')`);
    await queryRunner.query(
      `CREATE TYPE "BookingStatus" AS ENUM ('NEW', 'PENDING', 'AWAITING_CUSTOMER', 'AWAITING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED')`,
    );

    await queryRunner.query(`
      CREATE TABLE "admin_users" (
        "id" SERIAL NOT NULL,
        "name" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" "AdminRole" NOT NULL DEFAULT 'admin',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
        "setPasswordTokenHash" TEXT,
        "setPasswordExpires" TIMESTAMP(3),
        CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
      )`);

    await queryRunner.query(`
      CREATE TABLE "destinations" (
        "id" SERIAL NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "country" TEXT NOT NULL,
        "overview" TEXT NOT NULL,
        "attractions" TEXT[] DEFAULT '{}',
        "activities" TEXT[] DEFAULT '{}',
        "bestTimeToVisit" TEXT,
        "heroImage" TEXT,
        "images" TEXT[] DEFAULT '{}',
        "isFeatured" BOOLEAN NOT NULL DEFAULT false,
        "isPublished" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
        CONSTRAINT "destinations_pkey" PRIMARY KEY ("id")
      )`);

    await queryRunner.query(`
      CREATE TABLE "tours" (
        "id" SERIAL NOT NULL,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "durationDays" INTEGER NOT NULL,
        "durationNights" INTEGER NOT NULL,
        "startingPrice" DECIMAL(10,2),
        "currency" TEXT NOT NULL DEFAULT 'USD',
        "overview" TEXT NOT NULL,
        "highlights" TEXT[] DEFAULT '{}',
        "inclusions" TEXT[] DEFAULT '{}',
        "exclusions" TEXT[] DEFAULT '{}',
        "requirements" TEXT[] DEFAULT '{}',
        "featuredImage" TEXT,
        "images" TEXT[] DEFAULT '{}',
        "isFeatured" BOOLEAN NOT NULL DEFAULT false,
        "isPublished" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
        "destinationId" INTEGER NOT NULL,
        CONSTRAINT "tours_pkey" PRIMARY KEY ("id")
      )`);

    await queryRunner.query(`
      CREATE TABLE "itinerary_days" (
        "id" SERIAL NOT NULL,
        "dayNumber" INTEGER NOT NULL,
        "title" TEXT NOT NULL,
        "activities" TEXT[] DEFAULT '{}',
        "tourId" INTEGER NOT NULL,
        CONSTRAINT "itinerary_days_pkey" PRIMARY KEY ("id")
      )`);

    await queryRunner.query(`
      CREATE TABLE "inquiries" (
        "id" SERIAL NOT NULL,
        "fullName" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT,
        "destinationName" TEXT,
        "preferredDate" TIMESTAMP(3),
        "numberOfTravelers" INTEGER,
        "message" TEXT,
        "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
        "tourId" INTEGER,
        CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
      )`);

    await queryRunner.query(`
      CREATE TABLE "booking_requests" (
        "id" SERIAL NOT NULL,
        "fullName" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "nationality" TEXT,
        "travelDate" TIMESTAMP(3) NOT NULL,
        "numberOfTravelers" INTEGER NOT NULL,
        "accommodationPref" TEXT,
        "specialRequests" TEXT,
        "status" "BookingStatus" NOT NULL DEFAULT 'NEW',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
        "tourId" INTEGER NOT NULL,
        CONSTRAINT "booking_requests_pkey" PRIMARY KEY ("id")
      )`);

    await queryRunner.query(`
      CREATE TABLE "faqs" (
        "id" SERIAL NOT NULL,
        "question" TEXT NOT NULL,
        "answer" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        "isPublished" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "faqs_pkey" PRIMARY KEY ("id")
      )`);

    await queryRunner.query(`
      CREATE TABLE "testimonials" (
        "id" SERIAL NOT NULL,
        "customerName" TEXT NOT NULL,
        "country" TEXT,
        "category" TEXT,
        "content" TEXT NOT NULL,
        "photo" TEXT,
        "isApproved" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
        CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
      )`);

    await queryRunner.query(`
      CREATE TABLE "blog_posts" (
        "id" SERIAL NOT NULL,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "featuredImage" TEXT,
        "author" TEXT,
        "category" TEXT,
        "tags" TEXT[] DEFAULT '{}',
        "isPublished" BOOLEAN NOT NULL DEFAULT true,
        "publishedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
        CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
      )`);

    await queryRunner.query(`CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users" ("email")`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "admin_users_setPasswordTokenHash_key" ON "admin_users" ("setPasswordTokenHash")`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "destinations_slug_key" ON "destinations" ("slug")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "tours_slug_key" ON "tours" ("slug")`);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "itinerary_days_tourId_dayNumber_key" ON "itinerary_days" ("tourId", "dayNumber")`,
    );
    await queryRunner.query(`CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts" ("slug")`);

    await queryRunner.query(
      `ALTER TABLE "tours" ADD CONSTRAINT "tours_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destinations"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "itinerary_days" ADD CONSTRAINT "itinerary_days_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "booking_requests" ADD CONSTRAINT "booking_requests_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "tours"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Children before parents, so no foreign key blocks a drop.
    await queryRunner.query(`DROP TABLE "booking_requests"`);
    await queryRunner.query(`DROP TABLE "inquiries"`);
    await queryRunner.query(`DROP TABLE "itinerary_days"`);
    await queryRunner.query(`DROP TABLE "tours"`);
    await queryRunner.query(`DROP TABLE "destinations"`);
    await queryRunner.query(`DROP TABLE "admin_users"`);
    await queryRunner.query(`DROP TABLE "faqs"`);
    await queryRunner.query(`DROP TABLE "testimonials"`);
    await queryRunner.query(`DROP TABLE "blog_posts"`);
    await queryRunner.query(`DROP TYPE "BookingStatus"`);
    await queryRunner.query(`DROP TYPE "InquiryStatus"`);
    await queryRunner.query(`DROP TYPE "AdminRole"`);
  }
}
