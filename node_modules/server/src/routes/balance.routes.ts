import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { calculatePairwiseBalances } from '../services/balance.service.js';

const router = Router();

router.use(requireAuth);

/**
 * GET /api/balances
 * Returns pairwise net balances and shared expense breakdown with all flatmates.
 */
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const currentUserId = req.user!.id;

    // Fetch all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
      orderBy: { name: 'asc' },
    });

    // Fetch all group items with their splits
    const groupItems = await prisma.item.findMany({
      where: { type: 'group' },
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
        total: true,
        type: true,
        paidById: true,
        createdAt: true,
        splits: {
          select: {
            id: true,
            userId: true,
            share: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch all settlements
    const settlements = await prisma.settlement.findMany({
      select: {
        id: true,
        fromUserId: true,
        toUserId: true,
        amount: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const balances = calculatePairwiseBalances(
      currentUserId,
      allUsers,
      groupItems,
      settlements
    );

    // Compute high-level totals
    let totalOwedToYou = 0;
    let totalYouOwe = 0;

    for (const b of balances) {
      if (b.netBalance > 0) {
        totalOwedToYou += b.netBalance;
      } else if (b.netBalance < 0) {
        totalYouOwe += Math.abs(b.netBalance);
      }
    }

    res.json({
      success: true,
      totals: {
        totalOwedToYou,
        totalYouOwe,
        netBalance: totalOwedToYou - totalYouOwe,
      },
      balances,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
