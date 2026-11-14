import { prisma } from '../prisma.js';
import { env } from './env.js';
import { supabaseAdmin } from './supabase.js';

export async function seedAdmin(): Promise<void> {
  try {
    const adminEmail = env.ADMIN_EMAIL.toLowerCase();
    const existingPrismaAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (!existingPrismaAdmin) {
      console.log(`[SeedAdmin] Initializing admin user ${adminEmail}...`);

      // Check if user already exists in Supabase Auth
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      let supabaseUser = listData?.users?.find(
        (u) => u.email?.toLowerCase() === adminEmail
      );

      if (!supabaseUser) {
        // Create admin user in Supabase Auth
        const { data: supabaseData, error: supabaseError } =
          await supabaseAdmin.auth.admin.createUser({
            email: adminEmail,
            password: env.ADMIN_PASSWORD,
            email_confirm: true,
            user_metadata: { name: 'Admin' },
          });

        if (supabaseError) {
          console.error(`[SeedAdmin] Could not create admin in Supabase Auth:`, supabaseError.message);
          return;
        }
        supabaseUser = supabaseData.user;
      } else {
        // Ensure password is up to date and email is confirmed
        await supabaseAdmin.auth.admin.updateUserById(supabaseUser.id, {
          password: env.ADMIN_PASSWORD,
          email_confirm: true,
        });
      }

      await prisma.user.create({
        data: {
          name: 'Admin',
          email: adminEmail,
          passwordHash: '(managed-by-supabase)',
          role: 'admin',
          active: true,
          supabaseId: supabaseUser.id,
        },
      });

      console.log(`[SeedAdmin] Default admin created successfully.`);
    } else if (!existingPrismaAdmin.supabaseId) {
      console.log(`[SeedAdmin] Linking existing Prisma admin to Supabase Auth...`);
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      let supabaseUser = listData?.users?.find(
        (u) => u.email?.toLowerCase() === adminEmail
      );

      if (!supabaseUser) {
        const { data: supabaseData } = await supabaseAdmin.auth.admin.createUser({
          email: adminEmail,
          password: env.ADMIN_PASSWORD,
          email_confirm: true,
          user_metadata: { name: existingPrismaAdmin.name || 'Admin' },
        });
        supabaseUser = supabaseData?.user ?? undefined;
      }

      if (supabaseUser) {
        await prisma.user.update({
          where: { id: existingPrismaAdmin.id },
          data: { supabaseId: supabaseUser.id },
        });
        console.log(`[SeedAdmin] Linked Prisma admin to Supabase user ${supabaseUser.id}.`);
      }
    }
  } catch (error) {
    console.error('[SeedAdmin] Failed to initialize admin user:', error);
  }
}
