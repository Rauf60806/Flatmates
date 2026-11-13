import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

/**
 * GET /api/items/suggestions?q=term
 * Returns unique past item names with their most recently recorded unit price.
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = (req.query.q as string || '').trim();

      // Find recent items ordered by createdAt DESC
      const items = await prisma.item.findMany({
        where: query
          ? {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            }
          : undefined,
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          name: true,
          price: true,
          createdAt: true,
        },
      });

      // Deduplicate by name, keeping the most recent price
      const suggestionMap = new Map<string, number>();
      for (const item of items) {
        const normalized = item.name.trim();
        if (!suggestionMap.has(normalized.toLowerCase())) {
          suggestionMap.set(normalized.toLowerCase(), item.price);
        }
      }

      // Convert back to array with properly cased display name
      const uniqueNames = new Set<string>();
      const suggestions: Array<{ name: string; lastPrice: number }> = [];

      for (const item of items) {
        const lower = item.name.trim().toLowerCase();
        if (!uniqueNames.has(lower)) {
          uniqueNames.add(lower);
          suggestions.push({
            name: item.name.trim(),
            lastPrice: suggestionMap.get(lower) || item.price,
          });
        }
        if (suggestions.length >= 8) break;
      }

      res.json({
        success: true,
        suggestions,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
