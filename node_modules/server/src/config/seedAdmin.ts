import { prisma } from '../prisma.js';
import { env } from './env.js';
import { supabaseAdmin } from './supabase.js';

export async function seedAdmin(): Promise<void> {
  try {
    const adminCount = await prisma.user.count({
      where: { role: 'admin' },
    });

    if (adminCount === 0) {
      console.log(`[SeedAdmin] No admin user detected. Initializing ${env.ADMIN_EMAIL}...`);

      // Create admin user in Supabase Auth
      const { data: supabaseData, error: supabaseError } =
        await supabaseAdmin.auth.admin.createUser({
          email: env.ADMIN_EMAIL,
          password: env.ADMIN_PASSWORD,
          email_confirm: true,
          user_metadata: { name: 'Admin' },
        });

      if (supabaseError) {
        // If the user already exists in Supabase, look them up
        console.log(`[SeedAdmin] Supabase user may already exist: ${supabaseError.message}`);

        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existingSupabaseUser = listData?.users?.find(
          (u) => u.email === env.ADMIN_EMAIL
        );

        if (existingSupabaseUser) {
          await prisma.user.create({
            data: {
              name: 'Admin',
              email: env.ADMIN_EMAIL,
              passwordHash: '(managed-by-supabase)',
              role: 'admin',
              active: true,
              supabaseId: existingSupabaseUser.id,
            },
          });
          console.log(`[SeedAdmin] Default admin created (linked to existing Supabase user).`);
        } else {
          console.error(`[SeedAdmin] Could not create admin in Supabase Auth.`);
        }
        return;
      }

      await prisma.user.create({
        data: {
          name: 'Admin',
          email: env.ADMIN_EMAIL,
          passwordHash: '(managed-by-supabase)',
          role: 'admin',
          active: true,
          supabaseId: supabaseData.user.id,
        },
      });

      console.log(`[SeedAdmin] Default admin created successfully.`);
    }
  } catch (error) {
    console.error('[SeedAdmin] Failed to initialize admin user:', error);
  }
}
