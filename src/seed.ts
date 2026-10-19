import bcrypt from 'bcryptjs';
import { AppDataSource } from './config/data-source';
import { AdminUser } from './entities/AdminUser';
import { AdminRole } from './entities/enums';


async function main(): Promise<void> {
  const name = process.env.SEED_ADMIN_NAME;
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      'SEED_ADMIN_NAME, SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env before seeding.',
    );
  }

  await AppDataSource.initialize();
  const adminRepo = AppDataSource.getRepository(AdminUser);

  const existing = await adminRepo.findOneBy({ email });
  if (existing) {
    console.log(`Admin "${email}" already exists — skipping.`);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await adminRepo.save(
    adminRepo.create({ name, email, password: hashedPassword, role: AdminRole.ADMIN }),
  );

  console.log(`Seeded admin account: ${admin.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });
