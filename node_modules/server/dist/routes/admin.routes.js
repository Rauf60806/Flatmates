import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
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
router.get('/', async (_req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/admin/users
 */
router.post('/', validate(createUserSchema), async (req, res, next) => {
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
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(temporaryPassword, salt);
        const user = await prisma.user.create({
            data: {
                name,
                email: email.toLowerCase(),
                passwordHash,
                role,
                active: true,
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
    }
    catch (error) {
        next(error);
    }
});
/**
 * PATCH /api/admin/users/:id
 */
router.patch('/:id', validate(updateUserSchema), async (req, res, next) => {
    try {
        const id = req.params.id;
        const { active, name, resetPassword, role } = req.body;
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            res.status(404).json({ success: false, message: 'User not found.' });
            return;
        }
        const updateData = {};
        if (typeof active === 'boolean')
            updateData.active = active;
        if (name)
            updateData.name = name;
        if (role)
            updateData.role = role;
        if (resetPassword) {
            const salt = await bcrypt.genSalt(10);
            updateData.passwordHash = await bcrypt.hash(resetPassword, salt);
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
    }
    catch (error) {
        next(error);
    }
});
export default router;
