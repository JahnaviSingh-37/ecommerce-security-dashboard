import { Router } from 'express';
import { body } from 'express-validator';
import { 
  startScan, 
  getScanHistory, 
  getScanDetails,
  cancelScan 
} from '../controllers/scan.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Start a new security scan
router.post(
  '/start',
  authenticate,
  authorize('admin', 'security_analyst'),
  [
    body('scanType').isIn(['sql_injection', 'xss', 'csrf', 'auth_weakness', 'full']),
    body('targetUrl').optional().isURL(),
  ],
  startScan
);

// Get scan history
router.get('/history', authenticate, getScanHistory);

// Get specific scan details
router.get('/:scanId', authenticate, getScanDetails);

// Cancel a running scan
router.post('/:scanId/cancel', authenticate, authorize('admin', 'security_analyst'), cancelScan);

export default router;
