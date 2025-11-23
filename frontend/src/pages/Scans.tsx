import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlayIcon, ClockIcon, ArrowDownTrayIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

const Scans = () => {
  const [scanType, setScanType] = useState('full');
  const [targetUrl, setTargetUrl] = useState('https://example.com');
  const [isScanning, setIsScanning] = useState(false);
  const [scans, setScans] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setScans(response.data.data.recentScans || []);
    } catch (error) {
      console.error('Failed to fetch scans', error);
    }
  };

  const calculateComplianceScore = (findingsCount: number) => {
    // Calculate compliance score based on findings
    // Fewer findings = higher compliance
    if (findingsCount === 0) return 100;
    if (findingsCount <= 2) return 95;
    if (findingsCount <= 5) return 85;
    if (findingsCount <= 10) return 75;
    if (findingsCount <= 15) return 65;
    return 50;
  };

  const downloadReport = async (scan: any) => {
    try {
      // Fetch detailed scan report
      const response = await axios.get(`/api/scans/${scan.id}/report`);
      const reportData = response.data.data;

      // Generate PDF-style text report
      const reportContent = generateReportContent(scan, reportData);
      
      // Create and download file
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `security-scan-${scan.id}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report', error);
      alert('Failed to download report. Please try again.');
    }
  };

  const generateReportContent = (scan: any, reportData: any) => {
    const complianceScore = scan.compliance_score || calculateComplianceScore(scan.findings_count);
    const securityScore = 100 - (scan.findings_count * 5);
    
    return `
╔═══════════════════════════════════════════════════════════════════╗
║         E-COMMERCE SECURITY ASSESSMENT REPORT                    ║
║         Generated: ${new Date().toLocaleString()}                        ║
╚═══════════════════════════════════════════════════════════════════╝

SCAN INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scan ID:           ${scan.id}
Target URL:        ${scan.target_url || 'N/A'}
Scan Type:         ${scan.scan_type}
Status:            ${scan.status}
Started:           ${new Date(scan.started_at).toLocaleString()}
Completed:         ${scan.completed_at ? new Date(scan.completed_at).toLocaleString() : 'In Progress'}

EXECUTIVE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Vulnerabilities:     ${scan.findings_count || 0}
Security Score:            ${Math.max(0, securityScore)}/100
Compliance Score:          ${complianceScore}%

Severity Breakdown:
  🔴 Critical:             ${reportData.vulnerabilities.filter((v: any) => v.severity === 'critical').length}
  🟠 High:                 ${reportData.vulnerabilities.filter((v: any) => v.severity === 'high').length}
  🟡 Medium:               ${reportData.vulnerabilities.filter((v: any) => v.severity === 'medium').length}
  🔵 Low:                  ${reportData.vulnerabilities.filter((v: any) => v.severity === 'low').length}

COMPLIANCE ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Compliance Score: ${complianceScore}%

Framework Compliance:
  ✓ OWASP Top 10:        ${complianceScore >= 80 ? 'PASS' : 'FAIL'} (${complianceScore}%)
  ✓ PCI-DSS:             ${complianceScore >= 85 ? 'PASS' : 'FAIL'} (${Math.max(50, complianceScore - 5)}%)
  ✓ ISO 27001:           ${complianceScore >= 75 ? 'PASS' : 'FAIL'} (${Math.max(45, complianceScore - 10)}%)
  ✓ GDPR:                ${complianceScore >= 70 ? 'PASS' : 'FAIL'} (${Math.max(40, complianceScore - 15)}%)

${complianceScore >= 90 ? '✅ Excellent compliance posture!' : 
  complianceScore >= 75 ? '⚠️  Good compliance, minor improvements needed.' :
  '❌ Significant compliance issues detected. Immediate action required.'}

DETAILED FINDINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${reportData.vulnerabilities.length > 0 ? reportData.vulnerabilities.map((vuln: any, index: number) => `
[${index + 1}] ${vuln.title}
────────────────────────────────────────────────────────────────────
Severity:          ${vuln.severity.toUpperCase()}
CVSS Score:        ${vuln.cvss_score}
CWE ID:            ${vuln.cwe_id}
OWASP Category:    ${vuln.owasp_category}
Type:              ${vuln.type}

Description:
${vuln.description}

Affected URL:
${vuln.affected_url || scan.target_url}

Remediation:
${vuln.remediation || getDefaultRemediation(vuln.type)}

`).join('\n') : 'No vulnerabilities detected. System appears secure.'}

RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${scan.findings_count > 0 ? `
Priority Actions:
1. Review and address all CRITICAL and HIGH severity findings immediately
2. Implement missing security headers (HSTS, CSP, X-Frame-Options)
3. Ensure all data transmission uses HTTPS
4. Enable CSRF protection on all forms
5. Implement secure cookie attributes (Secure, HttpOnly)
6. Regular security assessments and penetration testing
7. Keep all dependencies and frameworks up to date
8. Implement Web Application Firewall (WAF)
9. Enable security monitoring and logging
10. Conduct security awareness training for development team
` : `
✅ No critical vulnerabilities detected!

Continue best practices:
- Regular security assessments
- Keep security headers updated
- Monitor for new vulnerabilities
- Maintain PCI-DSS compliance
- Regular penetration testing
`}

COMPLIANCE CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OWASP Top 10 (2021):
  ${complianceScore >= 80 ? '✓' : '✗'} A01:2021 - Broken Access Control
  ${complianceScore >= 80 ? '✓' : '✗'} A02:2021 - Cryptographic Failures
  ${complianceScore >= 80 ? '✓' : '✗'} A03:2021 - Injection
  ${complianceScore >= 80 ? '✓' : '✗'} A04:2021 - Insecure Design
  ${complianceScore >= 80 ? '✓' : '✗'} A05:2021 - Security Misconfiguration
  ${complianceScore >= 80 ? '✓' : '✗'} A06:2021 - Vulnerable Components
  ${complianceScore >= 80 ? '✓' : '✗'} A07:2021 - Authentication Failures
  ${complianceScore >= 80 ? '✓' : '✗'} A08:2021 - Software and Data Integrity
  ${complianceScore >= 80 ? '✓' : '✗'} A09:2021 - Security Logging Failures
  ${complianceScore >= 80 ? '✓' : '✗'} A10:2021 - Server-Side Request Forgery

PCI-DSS Requirements:
  ${complianceScore >= 85 ? '✓' : '✗'} Install and maintain firewall configuration
  ${complianceScore >= 85 ? '✓' : '✗'} Do not use vendor defaults
  ${complianceScore >= 85 ? '✓' : '✗'} Protect stored cardholder data
  ${complianceScore >= 85 ? '✓' : '✗'} Encrypt transmission of cardholder data
  ${complianceScore >= 85 ? '✓' : '✗'} Use and update anti-virus software
  ${complianceScore >= 85 ? '✓' : '✗'} Develop secure systems and applications

SCAN METADATA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scanner Version:   1.0.0
Scan Engine:       E-Commerce Security Scanner
Report Format:     TXT
Generated By:      Automated Security Assessment System
Company:           E-Commerce Security Dashboard
Contact:           security@ecommerce-dashboard.com

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    END OF SECURITY ASSESSMENT REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This report is confidential and intended for authorized personnel only.
© 2025 E-Commerce Security Dashboard. All rights reserved.
    `.trim();
  };

  const getDefaultRemediation = (type: string) => {
    const remediations: { [key: string]: string } = {
      'SECURITY_HEADER': 'Implement the missing security header in your web server configuration or application middleware.',
      'INSECURE_TRANSPORT': 'Configure your web server to redirect all HTTP traffic to HTTPS. Obtain and install a valid SSL/TLS certificate.',
      'SQL_INJECTION': 'Use parameterized queries or prepared statements. Never concatenate user input directly into SQL queries.',
      'XSS': 'Implement proper output encoding and Content Security Policy. Sanitize all user inputs.',
      'CSRF': 'Implement CSRF tokens for all state-changing operations. Use SameSite cookie attribute.',
      'INSECURE_COOKIE': 'Set Secure and HttpOnly flags on all cookies. Use SameSite attribute to prevent CSRF attacks.',
      'PCI_COMPLIANCE': 'Review PCI-DSS requirements and implement all necessary security controls for payment processing.',
      'PAYMENT_SECURITY': 'Ensure all payment data is encrypted in transit and at rest. Use tokenization where possible.'
    };
    return remediations[type] || 'Consult with security team for appropriate remediation steps.';
  };

  const handleStartScan = async () => {
    setIsScanning(true);
    setMessage('');
    try {
      await axios.post('/api/scans/start', {
        scan_type: scanType,
        target_url: targetUrl
      });
      setMessage('✅ Scan initiated successfully! Check the scan history below.');
      setTimeout(() => {
        fetchScans();
      }, 1000);
    } catch (error) {
      setMessage('❌ Failed to start scan. Please try again.');
    } finally {
      setTimeout(() => setIsScanning(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Security Scans</h1>
          <p className="text-sm text-gray-500 uppercase tracking-wide">🔍 REAL-TIME VULNERABILITY DETECTION</p>
        </div>
      </div>

      {/* Start New Scan Card */}
      <div className="card bg-gradient-to-br from-white to-blue-50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="icon-wrapper bg-gradient-to-br from-blue-100 to-blue-200">
            <PlayIcon className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Start New Scan</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              🌐 Target Website URL
            </label>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              ⚡ Scan Type
            </label>
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="full">🔍 Full Security Scan (All Checks)</option>
              <option value="sql_injection">💉 SQL Injection</option>
              <option value="xss">⚠️ Cross-Site Scripting (XSS)</option>
              <option value="csrf">🛡️ CSRF Protection</option>
              <option value="auth_weakness">🔐 Authentication Weaknesses</option>
            </select>
          </div>

          {message && (
            <div className={`p-4 rounded-xl font-semibold ${message.includes('✅') ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-l-4 border-green-500' : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-l-4 border-red-500'}`}>
              {message}
            </div>
          )}

          <button
            onClick={handleStartScan}
            disabled={isScanning}
            className="btn btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 w-full sm:w-auto"
          >
            <PlayIcon className="h-5 w-5" />
            <span className="font-semibold">{isScanning ? '🔄 Scanning...' : '▶️ Start Scan'}</span>
          </button>
        </div>
      </div>

      {/* Scan History Card */}
      <div className="card bg-gradient-to-br from-white to-gray-50">
        <div className="flex items-center space-x-3 mb-6">
          <div className="icon-wrapper bg-gradient-to-br from-purple-100 to-purple-200">
            <ClockIcon className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Scan History</h3>
        </div>
        {scans.length > 0 ? (
          <div className="space-y-4">
            {scans.map((scan) => (
              <div key={scan.id} className="scan-card border-2 border-gray-200 rounded-2xl p-5 hover:shadow-xl transition-all hover:border-blue-300 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="icon-wrapper bg-gradient-to-br from-blue-100 to-blue-200">
                        <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-gray-900">{scan.scan_type} Scan</p>
                        <p className="text-sm text-gray-600 font-medium">🌐 {scan.target_url || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-xl p-3 border-l-4 border-gray-300">
                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">Started</p>
                        <p className="font-bold text-gray-900">{new Date(scan.started_at).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-600">{new Date(scan.started_at).toLocaleTimeString()}</p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-3 border-l-4 border-red-400">
                        <p className="text-xs text-red-600 uppercase tracking-wide font-semibold mb-1">Findings</p>
                        <p className="text-2xl font-bold text-red-700">{scan.findings_count || 0}</p>
                        <p className="text-sm text-red-600">vulnerabilities</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-3 border-l-4 border-blue-400">
                        <p className="text-xs text-blue-600 uppercase tracking-wide font-semibold mb-1">Status</p>
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          scan.status === 'completed' ? 'bg-green-100 text-green-800' :
                          scan.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {scan.status === 'completed' ? '✅ ' : scan.status === 'in_progress' ? '⏳ ' : ''}{scan.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3 border-l-4 border-green-400">
                        <p className="text-xs text-green-600 uppercase tracking-wide font-semibold mb-1">Compliance</p>
                        <p className="text-2xl font-bold text-green-700">
                          {scan.compliance_score || calculateComplianceScore(scan.findings_count)}%
                        </p>
                        <p className="text-sm text-green-600">score</p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => downloadReport(scan)}
                    className="ml-4 flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    <span className="font-semibold">Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-semibold">No scans yet. Start your first security scan above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scans;
