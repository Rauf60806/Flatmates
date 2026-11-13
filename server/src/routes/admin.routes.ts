import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

// Protect all admin routes with authentication and admin role check
router.use(requireAuth, requireAdmin);

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid email address'),
  temporaryPassword: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['admin', 'member']).default('member'),
});

const updateUserSchema = z.object({
  active: z.boolean().optional(),
  name: z.string().min(2).optional(),
  resetPassword: z.string().min(6).optional(),
  role: z.enum(['admin', 'member']).optional(),
});

/**
 * GET /api/admin/users
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/users
 *
 * Creates a user in both Supabase Auth and the app database.
 */
router.post(
  '/',
  validate(createUserSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, temporaryPassword, role } = req.body;

      const existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existing) {
        res.status(409).json({
          success: false,
          message: 'A user with this email already exists.',
        });
        return;
      }

      // Create the user in Supabase Auth
      const { data: supabaseData, error: supabaseError } =
        await supabaseAdmin.auth.admin.createUser({
          email: email.toLowerCase(),
          password: temporaryPassword,
          email_confirm: true, // Auto-confirm the email
          user_metadata: { name },
        });

      if (supabaseError) {
        res.status(400).json({
          success: false,
          message: `Supabase Auth error: ${supabaseError.message}`,
        });
        return;
      }

      // Create the user in our app database
      const user = await prisma.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash: '(managed-by-supabase)',
          role,
          active: true,
          supabaseId: supabaseData.user.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
        },
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully.',
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /api/admin/users/:id
 */
router.patch(
  '/:id',
  validate(updateUserSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id as string;
      const { active, name, resetPassword, role } = req.body;

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      const updateData: any = {};
      if (typeof active === 'boolean') updateData.active = active;
      if (name) updateData.name = name;
      if (role) updateData.role = role;

      // If resetting password, update it in Supabase Auth
      if (resetPassword && user.supabaseId) {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
          user.supabaseId,
          { password: resetPassword }
        );

        if (error) {
          res.status(400).json({
            success: false,
            message: `Failed to reset password: ${error.message}`,
          });
          return;
        }
      }

      // If deactivating, also ban them in Supabase Auth
      if (typeof active === 'boolean' && user.supabaseId) {
        await supabaseAdmin.auth.admin.updateUserById(
          user.supabaseId,
          { ban_duration: active ? 'none' : '876000h' } // ~100 years = effectively permanent
        );
      }

      const updated = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          updatedAt: true,
        },
      });

      res.json({
        success: true,
        message: 'User updated successfully.',
        user: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
