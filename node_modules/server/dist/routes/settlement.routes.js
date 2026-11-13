import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
const router = Router();
router.use(requireAuth);
const recordSettlementSchema = z.object({
    toUserId: z.string().min(1, 'Recipient flatmate is required'),
    amount: z.number().int().positive('Settlement amount must be a positive integer in minor units'),
    fromUserId: z.string().optional(),
});
/**
 * POST /api/settlements
 * Records a direct peer-to-peer settlement payment (e.g. via UPI / cash).
 */
router.post('/', validate(recordSettlementSchema), async (req, res, next) => {
    try {
        const { toUserId, amount, fromUserId: specifiedFromId } = req.body;
        const currentUserId = req.user.id;
        // Allow specifying fromUserId only if admin, otherwise default to current logged-in user
        const fromUserId = req.user.role === 'admin' && specifiedFromId ? specifiedFromId : currentUserId;
        if (fromUserId === toUserId) {
            res.status(400).json({
                success: false,
                message: 'Cannot record a settlement to yourself.',
            });
            return;
        }
        // Verify recipient exists
        const recipient = await prisma.user.findUnique({
            where: { id: toUserId },
        });
        if (!recipient) {
            res.status(404).json({
                success: false,
                message: 'Recipient flatmate not found.',
            });
            return;
        }
        const settlement = await prisma.settlement.create({
            data: {
                fromUserId,
                toUserId,
                amount,
            },
            include: {
                fromUser: { select: { id: true, name: true, email: true } },
                toUser: { select: { id: true, name: true, email: true } },
            },
        });
        res.status(201).json({
            success: true,
            message: 'Settlement recorded successfully.',
            settlement,
        });
    }
    catch (error) {
        next(error);
    }
});
export default router;
