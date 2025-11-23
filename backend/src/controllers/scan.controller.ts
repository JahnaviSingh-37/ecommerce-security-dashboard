import { Response } from 'express';
import { validationResult } from 'express-validator';
import { db } from '../index';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';
import { runSecurityScan } from '../services/scanner/scanService';

export const startScan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { scanType, targetUrl } = req.body;
    const userId = req.user?.id;

    // Check for active scans
    const activeScan = await db.query(
      "SELECT id FROM vulnerability_scans WHERE status IN ('pending', 'in_progress') LIMIT 1"
    );

    if (activeScan.rows.length > 0) {
      res.status(409).json({
        success: false,
        message: 'Another scan is currently in progress',
      });
      return;
    }

    // Create scan record
    const result = await db.query(
      'INSERT INTO vulnerability_scans (scan_type, target_url, status, initiated_by) VALUES ($1, $2, $3, $4) RETURNING id',
      [scanType, targetUrl || null, 'pending', userId]
    );

    const scanId = result.rows[0].id;

    // Log audit
    await db.query(
      'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, status, details) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, 'SCAN_START', 'scan', scanId, 'success', JSON.stringify({ scanType, targetUrl })]
    );

    // Start scan asynchronously
    runSecurityScan(scanId, scanType, targetUrl).catch(error => {
      logger.error(`Scan ${scanId} failed:`, error);
    });

    logger.info(`Security scan ${scanId} started by user ${req.user?.username}`);

    res.status(201).json({
      success: true,
      message: 'Scan started successfully',
      data: { scanId },
    });
  } catch (error: any) {
    logger.error('Start scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const getScanHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = `
      SELECT 
        vs.id, vs.scan_type, vs.target_url, vs.status, 
        vs.started_at, vs.completed_at, vs.scan_duration,
        u.username as initiated_by,
        COUNT(v.id) as vulnerabilities_found
      FROM vulnerability_scans vs
      LEFT JOIN users u ON vs.initiated_by = u.id
      LEFT JOIN vulnerabilities v ON vs.id = v.scan_id
    `;

    const queryParams: any[] = [];
    
    if (status) {
      query += ' WHERE vs.status = $1';
      queryParams.push(status);
    }

    query += ' GROUP BY vs.id, u.username ORDER BY vs.started_at DESC LIMIT $' + 
      (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    
    queryParams.push(Number(limit), offset);

    const result = await db.query(query, queryParams);

    // Get total count
    const countQuery = status 
      ? 'SELECT COUNT(*) FROM vulnerability_scans WHERE status = $1'
      : 'SELECT COUNT(*) FROM vulnerability_scans';
    const countResult = await db.query(countQuery, status ? [status] : []);
    const total = parseInt(countResult.rows[0].count);

    res.status(200).json({
      success: true,
      data: {
        scans: result.rows,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      },
    });
  } catch (error: any) {
    logger.error('Get scan history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const getScanDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { scanId } = req.params;

    const scanResult = await db.query(
      `SELECT 
        vs.*, 
        u.username as initiated_by_username
      FROM vulnerability_scans vs
      LEFT JOIN users u ON vs.initiated_by = u.id
      WHERE vs.id = $1`,
      [scanId]
    );

    if (scanResult.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Scan not found',
      });
      return;
    }

    const vulnerabilities = await db.query(
      'SELECT * FROM vulnerabilities WHERE scan_id = $1 ORDER BY severity DESC, discovered_at DESC',
      [scanId]
    );

    res.status(200).json({
      success: true,
      data: {
        scan: scanResult.rows[0],
        vulnerabilities: vulnerabilities.rows,
      },
    });
  } catch (error: any) {
    logger.error('Get scan details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

export const cancelScan = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { scanId } = req.params;
    const userId = req.user?.id;

    const result = await db.query(
      "UPDATE vulnerability_scans SET status = 'failed', completed_at = CURRENT_TIMESTAMP WHERE id = $1 AND status IN ('pending', 'in_progress') RETURNING id",
      [scanId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Scan not found or already completed',
      });
      return;
    }

    // Log audit
    await db.query(
      'INSERT INTO audit_logs (user_id, action, resource_type, resource_id, status) VALUES ($1, $2, $3, $4, $5)',
      [userId, 'SCAN_CANCEL', 'scan', scanId, 'success']
    );

    logger.info(`Scan ${scanId} cancelled by user ${req.user?.username}`);

    res.status(200).json({
      success: true,
      message: 'Scan cancelled successfully',
    });
  } catch (error: any) {
    logger.error('Cancel scan error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
