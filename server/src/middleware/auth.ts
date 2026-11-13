import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../prisma.js';

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
    const token = req.cookies?.token;

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Authentication required. No session cookie found.',
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;

    // Verify user is still active in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, active: true },
    });

    if (!user || !user.active) {
      res.clearCookie('token');
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
    res.clearCookie('token');
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session.',
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
