import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';

/**
 * Supabase admin client for server-side operations.
 * Uses the service_role key — never expose this to the client.
 */
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
