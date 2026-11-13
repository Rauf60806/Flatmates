import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

/**
 * POST /api/auth/sync
 *
 * Called after a Supabase sign-up or first login to ensure the user
 * exists in our app database. Creates a new user row if needed.
 */
const syncSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

router.post(
  '/sync',
  requireAuth,
  validate(syncSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // User already exists (requireAuth found them) — just return their info
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
        },
      });

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/auth/me
 *
 * Returns the currently authenticated user.
 */
router.get(
  '/me',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          active: true,
          createdAt: true,
        },
      });

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      res.json({
        success: true,
        user,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/change-password
 *
 * Updates the user's password via Supabase Auth.
 */
const changePasswordSchema = z.object({
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

router.post(
  '/change-password',
  requireAuth,
  validate(changePasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { newPassword } = req.body;

      // Get the Supabase ID for this user
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { supabaseId: true },
      });

      if (!user?.supabaseId) {
        res.status(400).json({
          success: false,
          message: 'User not linked to Supabase Auth.',
        });
        return;
      }

      // Update password via Supabase Admin API
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        user.supabaseId,
        { password: newPassword }
      );

      if (error) {
        res.status(400).json({
          success: false,
          message: error.message || 'Failed to update password.',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Password updated successfully.',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
