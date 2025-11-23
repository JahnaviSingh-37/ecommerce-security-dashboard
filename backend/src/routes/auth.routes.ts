import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, getProfile, logout } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Register new user
router.post(
  '/register',
  [
    body('username').isLength({ min: 3 }).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
  ],
  register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  login
);

// Get current user profile
router.get('/profile', authenticate, getProfile);

// Logout
router.post('/logout', authenticate, logout);

export default router;
