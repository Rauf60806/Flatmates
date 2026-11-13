import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load from server root or project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  DIRECT_URL: z.string().optional(),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  ADMIN_EMAIL: z.string().email().default('admin@flatmates.local'),
  ADMIN_PASSWORD: z.string().min(6).default('AdminTemporaryPassword123!'),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),

  // Supabase
  SUPABASE_URL: z.string().url('SUPABASE_URL is required').default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required').default(''),

  // Also pick up VITE_ prefixed vars (loaded from root .env)
  VITE_SUPABASE_URL: z.string().url().optional(),
  VITE_SUPABASE_ANON_KEY: z.string().optional(),
});

const raw = process.env;

// Derive SUPABASE_URL from VITE_SUPABASE_URL if not set separately
if (!raw.SUPABASE_URL && raw.VITE_SUPABASE_URL) {
  raw.SUPABASE_URL = raw.VITE_SUPABASE_URL;
}

const parsed = envSchema.safeParse(raw);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
