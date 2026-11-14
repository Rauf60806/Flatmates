import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { calculateGroupSplit } from '../src/services/split.service.js';
import { supabaseAdmin } from '../src/config/supabase.js';

const prisma = new PrismaClient();

async function ensureSupabaseUser(email: string, password: string, name: string): Promise<string | null> {
  try {
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    const existing = listData?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    if (existing) {
      await supabaseAdmin.auth.admin.updateUserById(existing.id, {
        password,
        email_confirm: true,
        user_metadata: { name },
      });
      return existing.id;
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });

    if (error) {
      console.warn(`Supabase user creation notice for ${email}:`, error.message);
      return null;
    }

    return data.user.id;
  } catch (err: any) {
    console.warn(`Could not sync ${email} with Supabase:`, err?.message);
    return null;
  }
}

async function main() {
  console.log('--- Initializing Flatmates Accounts ---');

  // Clear existing records and reset all expenses/splits to 0
  await prisma.split.deleteMany({});
  await prisma.settlement.deleteMany({});
  await prisma.item.deleteMany({});
  await prisma.user.deleteMany({});

  const defaultPassword = 'Password123!';

  const flatmates = [
    { name: 'Rauf', email: 'rauf@flatmates.local', role: 'admin' as const },
    { name: 'Taz', email: 'taz@flatmates.local', role: 'member' as const },
    { name: 'Mamun', email: 'mamun@flatmates.local', role: 'member' as const },
    { name: 'Milon', email: 'milon@flatmates.local', role: 'member' as const },
    { name: 'Miraj', email: 'miraj@flatmates.local', role: 'member' as const },
    { name: 'Arefin', email: 'arefin@flatmates.local', role: 'member' as const },
  ];

  console.log('\nLogin Passwords for all accounts: Password123!\n');

  for (const f of flatmates) {
    const supabaseId = await ensureSupabaseUser(f.email, defaultPassword, f.name);
    await prisma.user.create({
      data: {
        name: f.name,
        email: f.email,
        passwordHash: '(managed-by-supabase)',
        role: f.role,
        active: true,
        supabaseId,
      },
    });
    console.log(`Created account for ${f.name} (${f.role}) - Email: ${f.email} | Password: ${defaultPassword}`);
  }

  console.log('\nInitialized 6 flatmate accounts successfully. All expenses set to 0.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
