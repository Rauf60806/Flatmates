import bcrypt from 'bcryptjs';
import { prisma } from '../prisma.js';
import { env } from './env.js';

export async function seedAdmin(): Promise<void> {
  try {
    const adminCount = await prisma.user.count({
      where: { role: 'admin' },
    });

    if (adminCount === 0) {
      console.log(`[SeedAdmin] No admin user detected. Initializing ${env.ADMIN_EMAIL}...`);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, salt);

      await prisma.user.create({
        data: {
          name: 'Admin',
          email: env.ADMIN_EMAIL,
          passwordHash,
          role: 'admin',
          active: true,
        },
      });
      console.log(`[SeedAdmin] Default admin created successfully.`);
    }
  } catch (error) {
    console.error('[SeedAdmin] Failed to initialize admin user:', error);
  }
}
