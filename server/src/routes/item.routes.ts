import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, validateQuery } from '../middleware/validate.js';
import { calculateGroupSplit } from '../services/split.service.js';

const router = Router();

router.use(requireAuth);

const createItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(100),
  price: z.number().int().positive('Unit price must be a positive integer in minor units (paise/cents)'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
  type: z.enum(['individual', 'group']).default('group'),
});

const listItemsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15),
  type: z.enum(['individual', 'group']).optional(),
});

/**
 * POST /api/items
 * Create an expense item with auto-split transaction.
 */
router.post(
  '/',
  validate(createItemSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, price, quantity, type } = req.body;
      const payerId = req.user!.id;
      const total = price * quantity;

      if (type === 'individual') {
        // Individual item: only the payer is associated with the split
        const item = await prisma.$transaction(async (tx) => {
          const newItem = await tx.item.create({
            data: {
              name: name.trim(),
              price,
              quantity,
              total,
              type: 'individual',
              paidById: payerId,
            },
          });

          await tx.split.create({
            data: {
              itemId: newItem.id,
              userId: payerId,
              share: total,
            },
          });

          return tx.item.findUnique({
            where: { id: newItem.id },
            include: {
              paidBy: { select: { id: true, name: true, email: true } },
              splits: {
                include: { user: { select: { id: true, name: true, email: true } } },
              },
            },
          });
        });

        res.status(201).json({
          success: true,
          message: 'Individual expense recorded successfully.',
          item,
        });
        return;
      }

      // Group item: fetch all active flatmates
      const activeUsers = await prisma.user.findMany({
        where: { active: true },
        select: { id: true },
      });

      if (activeUsers.length === 0) {
        res.status(400).json({
          success: false,
          message: 'No active flatmates found to split the expense.',
        });
        return;
      }

      const activeUserIds = activeUsers.map((u) => u.id);
      const calculatedSplits = calculateGroupSplit(total, payerId, activeUserIds);

      const item = await prisma.$transaction(async (tx) => {
        const newItem = await tx.item.create({
          data: {
            name: name.trim(),
            price,
            quantity,
            total,
            type: 'group',
            paidById: payerId,
          },
        });

        await tx.split.createMany({
          data: calculatedSplits.map((split) => ({
            itemId: newItem.id,
            userId: split.userId,
            share: split.share,
          })),
        });

        return tx.item.findUnique({
          where: { id: newItem.id },
          include: {
            paidBy: { select: { id: true, name: true, email: true } },
            splits: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
          },
        });
      });

      res.status(201).json({
        success: true,
        message: 'Group expense created and split successfully.',
        item,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/items
 * Paginated list of expense items ordered by createdAt DESC
 */
router.get(
  '/',
  validateQuery(listItemsQuerySchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page = 1, limit = 15, type } = req.query as any;
      const skip = (Number(page) - 1) * Number(limit);

      const whereClause: any = {};
      if (type) {
        whereClause.type = type;
      }

      const [totalCount, items] = await Promise.all([
        prisma.item.count({ where: whereClause }),
        prisma.item.findMany({
          where: whereClause,
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
          include: {
            paidBy: { select: { id: true, name: true, email: true } },
            splits: {
              include: {
                user: { select: { id: true, name: true, email: true } },
              },
            },
          },
        }),
      ]);

      const totalPages = Math.ceil(totalCount / Number(limit));

      res.json({
        success: true,
        items,
        pagination: {
          totalCount,
          currentPage: Number(page),
          totalPages,
          hasMore: Number(page) < totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
