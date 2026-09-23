import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Creates the FIRST admin account from .env. Run with `npx prisma db seed`.
// There is deliberately no public /register endpoint — every admin after
// this one is created through the protected POST /api/auth/admins route,
// which requires an already-logged-in admin.
async function main(): Promise<void> {
  const name = process.env.SEED_ADMIN_NAME;
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      'SEED_ADMIN_NAME, SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env before seeding.',
    );
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin "${email}" already exists — skipping.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.adminUser.create({
    data: { name, email, password: hashedPassword, role: 'ADMIN' },
  });

  console.log(`Seeded admin account: ${admin.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
