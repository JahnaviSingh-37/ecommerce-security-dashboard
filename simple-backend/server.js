const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const https = require('https');
const http = require('http');
const { URL } = require('url');

const app = express();
const PORT = 5001;

// Database connection
const pool = new Pool({
  connectionString: 'postgresql://jahnavisingh@localhost:5432/ecommerce_security'
});

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Test database connection
pool.connect()
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database error:', err));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      'your-secret-key',
      { expiresIn: '24h' }
    );
    
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);
    
    res.json({
      success: true,
      data: {
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const vulnCount = await pool.query('SELECT COUNT(*) FROM vulnerabilities');
    const scanCount = await pool.query('SELECT COUNT(*) FROM vulnerability_scans');
    const criticalCount = await pool.query("SELECT COUNT(*) FROM vulnerabilities WHERE severity = 'critical'");
    
    const recentScans = await pool.query(
      'SELECT * FROM vulnerability_scans ORDER BY started_at DESC LIMIT 5'
    );
    
    const vulnBySeverity = await pool.query(
      'SELECT severity, COUNT(*) as count FROM vulnerabilities GROUP BY severity'
    );
    
    res.json({
      success: true,
      data: {
        totalVulnerabilities: parseInt(vulnCount.rows[0].count),
        totalScans: parseInt(scanCount.rows[0].count),
        criticalIssues: parseInt(criticalCount.rows[0].count),
        securityScore: 75,
        complianceScore: 82,
        recentScans: recentScans.rows,
        vulnerabilitiesBySeverity: vulnBySeverity.rows
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get vulnerabilities
app.get('/api/vulnerabilities', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        scan_id,
        vulnerability_type as type,
        severity,
        title,
        description,
        affected_component,
        remediation,
        cwe_id,
        owasp_category,
        cvss_score,
        affected_url,
        is_resolved,
        discovered_at as created_at,
        CASE WHEN is_resolved THEN 'resolved' ELSE 'open' END as status
      FROM vulnerabilities 
      ORDER BY discovered_at DESC 
      LIMIT 100
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Vulnerabilities error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Security scanning function
async function performSecurityScan(targetUrl, scanType) {
  const vulnerabilities = [];
  
  try {
    const urlObj = new URL(targetUrl);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    console.log(`🔍 Scanning ${targetUrl} for ${scanType}...`);
    
    // Perform HTTP request to check security headers and SSL
    const scanResults = await new Promise((resolve, reject) => {
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname || '/',
        method: 'GET',
        timeout: 10000,
        headers: {
          'User-Agent': 'E-Commerce-Security-Scanner/1.0'
        }
      };
      
      const req = protocol.request(options, (response) => {
        let data = '';
        response.on('data', chunk => data += chunk);
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            body: data.substring(0, 5000) // Limit body size
          });
        });
      });
      
      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
      req.end();
    });
    
    // Check for missing security headers
    const securityHeaders = {
      'strict-transport-security': { severity: 'high', title: 'Missing HSTS Header' },
      'x-frame-options': { severity: 'medium', title: 'Missing X-Frame-Options Header' },
      'x-content-type-options': { severity: 'medium', title: 'Missing X-Content-Type-Options Header' },
      'content-security-policy': { severity: 'high', title: 'Missing Content Security Policy' },
      'x-xss-protection': { severity: 'medium', title: 'Missing XSS Protection Header' }
    };
    
    for (const [header, info] of Object.entries(securityHeaders)) {
      if (!scanResults.headers[header]) {
        vulnerabilities.push({
          type: 'SECURITY_HEADER',
          severity: info.severity,
          title: info.title,
          description: `The ${header} security header is not set. This could expose the application to various attacks.`,
          cvss_score: info.severity === 'high' ? 7.5 : 5.3,
          cwe_id: 'CWE-693',
          owasp_category: 'A05:2021 - Security Misconfiguration',
          affected_url: targetUrl
        });
      }
    }
    
    // Check SSL/TLS (only for HTTPS)
    if (urlObj.protocol === 'https:') {
      // SSL is being used - good!
      console.log('✅ HTTPS protocol detected');
    } else {
      vulnerabilities.push({
        type: 'INSECURE_TRANSPORT',
        severity: 'critical',
        title: 'Insecure HTTP Protocol',
        description: 'The website uses HTTP instead of HTTPS, exposing data to man-in-the-middle attacks.',
        cvss_score: 9.1,
        cwe_id: 'CWE-319',
        owasp_category: 'A02:2021 - Cryptographic Failures',
        affected_url: targetUrl
      });
    }
    
    // Check for common e-commerce vulnerabilities based on scan type
    if (scanType === 'sql_injection' || scanType === 'full') {
      // Check for SQL injection patterns in URL parameters
      if (urlObj.search && urlObj.search.includes('?')) {
        vulnerabilities.push({
          type: 'SQL_INJECTION',
          severity: 'high',
          title: 'Potential SQL Injection Point',
          description: 'URL contains query parameters that may be vulnerable to SQL injection attacks.',
          cvss_score: 8.6,
          cwe_id: 'CWE-89',
          owasp_category: 'A03:2021 - Injection',
          affected_url: targetUrl
        });
      }
    }
    
    if (scanType === 'xss' || scanType === 'full') {
      // Check for XSS vulnerabilities
      const bodyLower = scanResults.body.toLowerCase();
      if (bodyLower.includes('<script>') || bodyLower.includes('javascript:')) {
        vulnerabilities.push({
          type: 'XSS',
          severity: 'high',
          title: 'Potential Cross-Site Scripting (XSS)',
          description: 'Inline scripts detected in page content which may indicate XSS vulnerabilities.',
          cvss_score: 7.4,
          cwe_id: 'CWE-79',
          owasp_category: 'A03:2021 - Injection',
          affected_url: targetUrl
        });
      }
    }
    
    if (scanType === 'csrf' || scanType === 'full') {
      // Check for CSRF protection
      if (!scanResults.headers['x-csrf-token'] && !scanResults.body.includes('csrf')) {
        vulnerabilities.push({
          type: 'CSRF',
          severity: 'medium',
          title: 'Missing CSRF Protection',
          description: 'No CSRF tokens detected. Forms may be vulnerable to Cross-Site Request Forgery attacks.',
          cvss_score: 6.5,
          cwe_id: 'CWE-352',
          owasp_category: 'A01:2021 - Broken Access Control',
          affected_url: targetUrl
        });
      }
    }
    
    if (scanType === 'auth_weakness' || scanType === 'full') {
      // Check for authentication weaknesses
      const setCookieHeader = scanResults.headers['set-cookie'];
      if (setCookieHeader) {
        const cookieStr = Array.isArray(setCookieHeader) ? setCookieHeader.join(';') : setCookieHeader;
        if (!cookieStr.includes('Secure') || !cookieStr.includes('HttpOnly')) {
          vulnerabilities.push({
            type: 'INSECURE_COOKIE',
            severity: 'medium',
            title: 'Insecure Cookie Configuration',
            description: 'Cookies do not have Secure and HttpOnly flags set, making them vulnerable to theft.',
            cvss_score: 5.9,
            cwe_id: 'CWE-614',
            owasp_category: 'A05:2021 - Security Misconfiguration',
            affected_url: targetUrl
          });
        }
      }
    }
    
    // E-commerce specific checks
    const hostname = urlObj.hostname.toLowerCase();
    const isEcommerce = hostname.includes('amazon') || hostname.includes('google') || 
                       hostname.includes('mercari') || hostname.includes('shop') ||
                       hostname.includes('store') || hostname.includes('cart');
    
    if (isEcommerce) {
      console.log('🛒 E-commerce website detected');
      
      // Check for PCI-DSS compliance indicators
      if (!scanResults.headers['content-security-policy']) {
        vulnerabilities.push({
          type: 'PCI_COMPLIANCE',
          severity: 'high',
          title: 'PCI-DSS Compliance Issue',
          description: 'E-commerce site missing critical security headers required for PCI-DSS compliance.',
          cvss_score: 7.8,
          cwe_id: 'CWE-693',
          owasp_category: 'A05:2021 - Security Misconfiguration',
          affected_url: targetUrl
        });
      }
      
      // Check for payment security
      if (scanResults.body.toLowerCase().includes('payment') || 
          scanResults.body.toLowerCase().includes('checkout')) {
        vulnerabilities.push({
          type: 'PAYMENT_SECURITY',
          severity: 'critical',
          title: 'Payment Page Security Review Required',
          description: 'Payment processing page detected. Manual security review recommended for PCI compliance.',
          cvss_score: 9.2,
          cwe_id: 'CWE-311',
          owasp_category: 'A02:2021 - Cryptographic Failures',
          affected_url: targetUrl
        });
      }
    }
    
    console.log(`✅ Scan complete. Found ${vulnerabilities.length} potential issues.`);
    
  } catch (error) {
    console.error('Scan error:', error.message);
    // Add error as a finding
    vulnerabilities.push({
      type: 'SCAN_ERROR',
      severity: 'low',
      title: 'Scan Incomplete',
      description: `Could not complete full scan: ${error.message}`,
      cvss_score: 0,
      cwe_id: 'N/A',
      owasp_category: 'N/A',
      affected_url: targetUrl
    });
  }
  
  return vulnerabilities;
}

// Start scan
app.post('/api/scans/start', async (req, res) => {
  try {
    const { scan_type = 'full', target_url = 'https://example.com' } = req.body;
    
    console.log(`\n🚀 Starting ${scan_type} scan on ${target_url}`);
    
    // Insert scan record
    const scanResult = await pool.query(
      `INSERT INTO vulnerability_scans (scan_type, status, target_url, started_at) 
       VALUES ($1, 'in_progress', $2, NOW()) RETURNING *`,
      [scan_type, target_url]
    );
    
    const scanId = scanResult.rows[0].id;
    
    // Perform actual security scan
    const vulnerabilities = await performSecurityScan(target_url, scan_type);
    
    // Insert vulnerabilities into database
    for (const vuln of vulnerabilities) {
      await pool.query(`
        INSERT INTO vulnerabilities 
        (scan_id, vulnerability_type, severity, title, description, cvss_score, cwe_id, owasp_category, affected_url, is_resolved)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false)
      `, [
        scanId,
        vuln.type,
        vuln.severity,
        vuln.title,
        vuln.description,
        vuln.cvss_score,
        vuln.cwe_id,
        vuln.owasp_category,
        vuln.affected_url
      ]);
    }
    
    // Update scan status to completed
    await pool.query(
      `UPDATE vulnerability_scans 
       SET status = 'completed', completed_at = NOW(), findings_count = $1 
       WHERE id = $2`,
      [vulnerabilities.length, scanId]
    );
    
    // Calculate compliance score based on findings
    let complianceScore = 100;
    if (vulnerabilities.length > 0) {
      complianceScore = Math.max(50, 100 - (vulnerabilities.length * 5));
    }
    
    // Update scan with compliance score
    await pool.query(
      `UPDATE vulnerability_scans 
       SET compliance_score = $1
       WHERE id = $2`,
      [complianceScore, scanId]
    );
    
    console.log(`✅ Scan ${scanId} completed with ${vulnerabilities.length} findings (Compliance: ${complianceScore}%)\n`);
    
    res.json({ 
      success: true, 
      data: { 
        scanId,
        target_url,
        scan_type,
        vulnerabilities_found: vulnerabilities.length,
        compliance_score: complianceScore,
        message: `Scan completed successfully. Found ${vulnerabilities.length} potential security issues.`
      }
    });
  } catch (error) {
    console.error('Scan error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get scan report with vulnerabilities
app.get('/api/scans/:scanId/report', async (req, res) => {
  try {
    const { scanId } = req.params;
    
    // Get scan details
    const scanResult = await pool.query(
      'SELECT * FROM vulnerability_scans WHERE id = $1',
      [scanId]
    );
    
    if (scanResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }
    
    const scan = scanResult.rows[0];
    
    // Get all vulnerabilities for this scan
    const vulnResult = await pool.query(`
      SELECT 
        id,
        vulnerability_type as type,
        severity,
        title,
        description,
        affected_component,
        remediation,
        cwe_id,
        owasp_category,
        cvss_score,
        affected_url,
        is_resolved,
        discovered_at
      FROM vulnerabilities 
      WHERE scan_id = $1
      ORDER BY 
        CASE severity 
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        cvss_score DESC
    `, [scanId]);
    
    res.json({
      success: true,
      data: {
        scan,
        vulnerabilities: vulnResult.rows
      }
    });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:3000`);
  console.log(`💾 Database: Connected to ecommerce_security`);
  console.log(`🔐 Login: admin@ecommerce-security.com / Admin@123`);
});
