import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { validateQuery } from '../middleware/validate.js';
import { getDailySummary, getSpendingStats } from '../services/stats.service.js';

const router = Router();

router.use(requireAuth);

const summaryQuerySchema = z.object({
  period: z.enum(['week', 'month']).default('week'),
});

/**
 * GET /api/summary?period=week|month
 */
router.get(
  '/summary',
  validateQuery(summaryQuerySchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const period = (req.query.period as 'week' | 'month') || 'week';
      const summary = await getDailySummary(req.user!.id, period);

      res.json({
        success: true,
        period,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/stats
 */
router.get(
  '/stats',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await getSpendingStats(req.user!.id);

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
