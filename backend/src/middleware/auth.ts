import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../index';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    // Fetch user from database
    const result = await db.query(
      'SELECT id, username, email, role, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    const user = result.rows[0];

    if (!user.is_active) {
      res.status(401).json({
        success: false,
        message: 'Account is inactive',
      });
      return;
    }

    req.user = {
      userId: user.id,
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expired',
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};
