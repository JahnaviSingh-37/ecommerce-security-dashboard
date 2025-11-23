import { Response } from 'express';
import { db } from '../index';
import { AuthRequest } from '../middleware/auth';
import logger from '../utils/logger';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get total vulnerabilities by severity
    const vulnStats = await db.query(`
      SELECT 
        severity,
        COUNT(*) as count,
        COUNT(CASE WHEN is_resolved = false THEN 1 END) as unresolved
      FROM vulnerabilities
      GROUP BY severity
    `);

    // Get recent scans
    const recentScans = await db.query(`
      SELECT 
        id, scan_type, status, started_at, completed_at, scan_duration
      FROM vulnerability_scans
      ORDER BY started_at DESC
      LIMIT 5
    `);

    // Get compliance scores
    const complianceScores = await db.query(`
      SELECT 
        cf.name as framework,
        COUNT(cc.id) as total_checks,
        COUNT(CASE WHEN cc.status = 'compliant' THEN 1 END) as compliant,
        ROUND(AVG(cc.compliance_score), 2) as avg_score
      FROM compliance_frameworks cf
      LEFT JOIN compliance_checks cc ON cf.id = cc.framework_id
      WHERE cf.is_active = true
      GROUP BY cf.name
    `);

    // Get security incidents by status
    const incidents = await db.query(`
      SELECT 
        status,
        severity,
        COUNT(*) as count
      FROM security_incidents
      GROUP BY status, severity
    `);

    // Get risk assessment summary
    const risks = await db.query(`
      SELECT 
        risk_level,
        COUNT(*) as count
      FROM risk_assessments
      WHERE status != 'mitigated'
      GROUP BY risk_level
    `);

    // Get recent audit logs
    const auditLogs = await db.query(`
      SELECT 
        al.action,
        al.resource_type,
        al.status,
        al.created_at,
        u.username
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    // Calculate overall security score (0-100)
    const totalVulns = vulnStats.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    const unresolvedVulns = vulnStats.rows.reduce((sum, row) => sum + parseInt(row.unresolved), 0);
    const criticalVulns = vulnStats.rows.find(row => row.severity === 'critical')?.unresolved || 0;
    const highVulns = vulnStats.rows.find(row => row.severity === 'high')?.unresolved || 0;

    const avgComplianceScore = complianceScores.rows.reduce((sum, row) => sum + parseFloat(row.avg_score || 0), 0) / 
      (complianceScores.rows.length || 1);

    // Security score calculation (weighted)
    let securityScore = 100;
    securityScore -= criticalVulns * 10; // -10 for each critical vuln
    securityScore -= highVulns * 5; // -5 for each high vuln
    securityScore -= (unresolvedVulns - criticalVulns - highVulns) * 1; // -1 for others
    securityScore = Math.max(0, Math.min(100, securityScore)); // Keep between 0-100

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalVulnerabilities: totalVulns,
          unresolvedVulnerabilities: unresolvedVulns,
          securityScore: Math.round(securityScore),
          averageComplianceScore: Math.round(avgComplianceScore),
        },
        vulnerabilities: {
          bySeverity: vulnStats.rows,
        },
        recentScans: recentScans.rows,
        compliance: complianceScores.rows,
        incidents: incidents.rows,
        risks: risks.rows,
        recentActivity: auditLogs.rows,
      },
    });
  } catch (error: any) {
    logger.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
