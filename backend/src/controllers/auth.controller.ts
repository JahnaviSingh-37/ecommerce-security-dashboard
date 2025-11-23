import { Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../index';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { username, email, password, role = 'user' } = req.body;

    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      res.status(400).json({
        success: false,
        message: 'User already exists',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, passwordHash, role]
    );

    const user = result.rows[0];

    await db.query(
      'INSERT INTO audit_logs (user_id, action, resource_type, status, details) VALUES ($1, $2, $3, $4, $5)',
      [user.id, 'USER_REGISTER', 'user', 'success', JSON.stringify({ username, email })]
    );

    logger.info(`New user registered: ${username}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error: any) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    const user = result.rows[0];

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    if (!user.is_active) {
      res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    await db.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    await db.query(
      'INSERT INTO audit_logs (user_id, action, resource_type, status, ip_address) VALUES ($1, $2, $3, $4, $5)',
      [user.id, 'USER_LOGIN', 'user', 'success', req.ip || 'unknown']
    );

    logger.info(`User logged in: ${user.username}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message,
    });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    const result = await db.query(
      'SELECT id, username, email, role, is_active, last_login, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    logger.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message,
    });
  }
};

export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (userId) {
      await db.query(
        'INSERT INTO audit_logs (user_id, action, resource_type, status) VALUES ($1, $2, $3, $4)',
        [userId, 'USER_LOGOUT', 'user', 'success']
      );

      logger.info(`User logged out: ${userId}`);
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error: any) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
      error: error.message,
    });
  }
};
