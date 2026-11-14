import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { supabaseAdmin } from '../config/supabase.js';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: 'admin' | 'member';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract the Supabase access token from the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. No access token found.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Verify the token with Supabase
    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !supabaseUser) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired access token.',
      });
      return;
    }

    // Look up the user in our database by their Supabase ID
    let user = await prisma.user.findUnique({
      where: { supabaseId: supabaseUser.id },
      select: { id: true, email: true, role: true, active: true },
    });

    // If not found by supabaseId, try by email (for migrated users)
    if (!user && supabaseUser.email) {
      user = await prisma.user.findUnique({
        where: { email: supabaseUser.email.toLowerCase() },
        select: { id: true, email: true, role: true, active: true },
      });

      // Link the Supabase ID to the existing user
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: { supabaseId: supabaseUser.id },
        });
      } else {
        // Auto-provision user in app database if authenticated in Supabase
        user = await prisma.user.create({
          data: {
            name: (supabaseUser.user_metadata?.name as string) || supabaseUser.email.split('@')[0],
            email: supabaseUser.email.toLowerCase(),
            passwordHash: '(managed-by-supabase)',
            role: 'member',
            active: true,
            supabaseId: supabaseUser.id,
          },
          select: { id: true, email: true, role: true, active: true },
        });
      }
    }

    if (!user || !user.active) {
      res.status(401).json({
        success: false,
        message: 'Account not found or has been deactivated.',
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as 'admin' | 'member',
    };

    next();
  } catch {
    res.status(401).json({
      success: false,
      message: 'Authentication failed.',
    });
  }
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Forbidden. Admin privileges required.',
    });
    return;
  }
  next();
}
