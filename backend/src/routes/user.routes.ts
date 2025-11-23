import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('admin'), (req, res) => {
  res.json({ success: true, message: 'Get all users' });
});

export default router;
