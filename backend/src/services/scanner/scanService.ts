import { db } from '../../index';
import logger from '../../utils/logger';
import { detectSQLInjection } from './sqlInjectionScanner';
import { detectXSS } from './xssScanner';
import { detectCSRF } from './csrfScanner';
import { detectAuthWeakness } from './authScanner';

export const runSecurityScan = async (
  scanId: number,
  scanType: string,
  targetUrl?: string
): Promise<void> => {
  const startTime = Date.now();

  try {
    // Update scan status
    await db.query(
      "UPDATE vulnerability_scans SET status = 'in_progress' WHERE id = $1",
      [scanId]
    );

    logger.info(`Starting scan ${scanId} of type ${scanType}`);

    const vulnerabilities: any[] = [];

    // Execute specific scan types
    if (scanType === 'sql_injection' || scanType === 'full') {
      const sqlVulns = await detectSQLInjection(targetUrl);
      vulnerabilities.push(...sqlVulns);
    }

    if (scanType === 'xss' || scanType === 'full') {
      const xssVulns = await detectXSS(targetUrl);
      vulnerabilities.push(...xssVulns);
    }

    if (scanType === 'csrf' || scanType === 'full') {
      const csrfVulns = await detectCSRF(targetUrl);
      vulnerabilities.push(...csrfVulns);
    }

    if (scanType === 'auth_weakness' || scanType === 'full') {
      const authVulns = await detectAuthWeakness();
      vulnerabilities.push(...authVulns);
    }

    // Insert vulnerabilities into database
    for (const vuln of vulnerabilities) {
      await db.query(
        `INSERT INTO vulnerabilities 
        (scan_id, vulnerability_type, severity, title, description, affected_component, remediation, cwe_id, owasp_category, cvss_score)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          scanId,
          vuln.type,
          vuln.severity,
          vuln.title,
          vuln.description,
          vuln.affectedComponent,
          vuln.remediation,
          vuln.cweId,
          vuln.owaspCategory,
          vuln.cvssScore,
        ]
      );
    }

    const duration = Math.round((Date.now() - startTime) / 1000);

    // Update scan completion
    await db.query(
      "UPDATE vulnerability_scans SET status = 'completed', completed_at = CURRENT_TIMESTAMP, scan_duration = $1 WHERE id = $2",
      [duration, scanId]
    );

    // Create notification for critical vulnerabilities
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical');
    if (criticalVulns.length > 0) {
      const scanResult = await db.query('SELECT initiated_by FROM vulnerability_scans WHERE id = $1', [scanId]);
      const userId = scanResult.rows[0]?.initiated_by;

      if (userId) {
        await db.query(
          `INSERT INTO notifications (user_id, notification_type, title, message, severity, sent_via)
          VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            userId,
            'vulnerability_alert',
            'Critical Vulnerabilities Detected',
            `Scan #${scanId} found ${criticalVulns.length} critical vulnerabilities requiring immediate attention.`,
            'critical',
            'both',
          ]
        );
      }
    }

    logger.info(`Scan ${scanId} completed successfully. Found ${vulnerabilities.length} vulnerabilities in ${duration}s`);
  } catch (error: any) {
    logger.error(`Scan ${scanId} failed:`, error);

    await db.query(
      "UPDATE vulnerability_scans SET status = 'failed', completed_at = CURRENT_TIMESTAMP WHERE id = $1",
      [scanId]
    );
  }
};
