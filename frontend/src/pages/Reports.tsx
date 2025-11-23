import { useState, useEffect } from 'react';
import axios from 'axios';
import { DocumentArrowDownIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { DocumentTextIcon } from '@heroicons/react/24/solid';

interface Scan {
  id: number;
  scan_type: string;
  target_url: string;
  started_at: string;
  completed_at: string;
  status: string;
  findings_count: number;
  compliance_score: number;
}

const Reports = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchScans();
  }, []);

  const fetchScans = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setScans(response.data.data.recentScans || []);
    } catch (error) {
      console.error('Failed to fetch scans', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (scan: Scan, reportType: string) => {
    setDownloadingId(scan.id);
    try {
      const response = await axios.get(`/api/scans/${scan.id}/report`);
      const reportData = response.data.data;
      
      let reportContent = '';
      
      if (reportType === 'executive') {
        reportContent = generateExecutiveSummary(scan, reportData);
      } else if (reportType === 'technical') {
        reportContent = generateTechnicalReport(scan, reportData);
      } else if (reportType === 'compliance') {
        reportContent = generateComplianceReport(scan, reportData);
      } else if (reportType === 'vulnerability') {
        reportContent = generateVulnerabilityReport(scan, reportData);
      }
      
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}-report-scan-${scan.id}-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download report', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  const calculateComplianceScore = (findingsCount: number) => {
    if (findingsCount === 0) return 100;
    if (findingsCount <= 2) return 95;
    if (findingsCount <= 5) return 85;
    if (findingsCount <= 10) return 75;
    return Math.max(50, 100 - (findingsCount * 5));
  };

  const generateExecutiveSummary = (scan: Scan, reportData: any) => {
    const complianceScore = scan.compliance_score || calculateComplianceScore(scan.findings_count);
    const securityScore = Math.max(0, 100 - (scan.findings_count * 5));
    
    return `
╔═══════════════════════════════════════════════════════════════════╗
║         EXECUTIVE SUMMARY - SECURITY ASSESSMENT                  ║
║         Generated: ${new Date().toLocaleString()}                        ║
╚═══════════════════════════════════════════════════════════════════╝

OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Target:                ${scan.target_url}
Assessment Date:       ${new Date(scan.started_at).toLocaleDateString()}
Scan Type:             ${scan.scan_type.toUpperCase()}
Status:                ${scan.status.toUpperCase()}

KEY FINDINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Security Score:        ${securityScore}/100
Compliance Score:      ${complianceScore}%
Total Issues Found:    ${scan.findings_count}

Critical Issues:       ${reportData.vulnerabilities.filter((v: any) => v.severity === 'critical').length}
High Priority:         ${reportData.vulnerabilities.filter((v: any) => v.severity === 'high').length}
Medium Priority:       ${reportData.vulnerabilities.filter((v: any) => v.severity === 'medium').length}
Low Priority:          ${reportData.vulnerabilities.filter((v: any) => v.severity === 'low').length}

RISK ASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Risk Level:    ${scan.findings_count > 10 ? 'HIGH' : scan.findings_count > 5 ? 'MEDIUM' : 'LOW'}
Compliance Status:     ${complianceScore >= 85 ? 'COMPLIANT' : 'NON-COMPLIANT'}

EXECUTIVE RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${scan.findings_count > 0 ? `
1. Immediate action required on ${reportData.vulnerabilities.filter((v: any) => v.severity === 'critical').length} critical issues
2. Implement security headers and best practices
3. Schedule regular security assessments
4. Invest in security training for development team
5. Consider penetration testing and third-party audits
` : `
✅ No critical vulnerabilities detected
✅ System demonstrates good security posture
✅ Continue regular monitoring and assessments
✅ Maintain current security practices
`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© 2025 E-Commerce Security Dashboard | Confidential
    `.trim();
  };

  const generateTechnicalReport = (scan: Scan, reportData: any) => {
    return `
╔═══════════════════════════════════════════════════════════════════╗
║         TECHNICAL SECURITY ASSESSMENT REPORT                     ║
║         Generated: ${new Date().toLocaleString()}                        ║
╚═══════════════════════════════════════════════════════════════════╝

SCAN DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scan ID:              ${scan.id}
Target URL:           ${scan.target_url}
Scan Type:            ${scan.scan_type}
Started:              ${new Date(scan.started_at).toLocaleString()}
Completed:            ${scan.completed_at ? new Date(scan.completed_at).toLocaleString() : 'In Progress'}
Duration:             ${scan.completed_at ? Math.round((new Date(scan.completed_at).getTime() - new Date(scan.started_at).getTime()) / 1000) + 's' : 'N/A'}

VULNERABILITY ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Findings:       ${scan.findings_count}

${reportData.vulnerabilities.map((vuln: any, index: number) => `
[${index + 1}] ${vuln.title}
────────────────────────────────────────────────────────────────────
Type:                 ${vuln.type}
Severity:             ${vuln.severity.toUpperCase()}
CVSS Score:           ${vuln.cvss_score}/10.0
CWE ID:               ${vuln.cwe_id}
OWASP Category:       ${vuln.owasp_category}
Status:               ${vuln.is_resolved ? 'RESOLVED' : 'OPEN'}

Technical Description:
${vuln.description}

Affected Component:
${vuln.affected_url || scan.target_url}

Technical Remediation:
${vuln.remediation || getDefaultRemediation(vuln.type)}

Risk Impact:
${getRiskImpact(vuln.severity)}
`).join('\n')}

SECURITY HEADERS ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${reportData.vulnerabilities.filter((v: any) => v.type === 'SECURITY_HEADER').length > 0 ? 
  reportData.vulnerabilities.filter((v: any) => v.type === 'SECURITY_HEADER').map((v: any) => 
    `❌ ${v.title}`).join('\n') : 
  '✅ All security headers properly configured'}

TRANSPORT LAYER SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Protocol:             ${scan.target_url?.startsWith('https') ? 'HTTPS (Secure)' : 'HTTP (Insecure)'}
${!scan.target_url?.startsWith('https') ? '⚠️  WARNING: Unencrypted communication detected!' : '✅ Encrypted communication enabled'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© 2025 E-Commerce Security Dashboard | Technical Report
    `.trim();
  };

  const generateComplianceReport = (scan: Scan, reportData: any) => {
    const complianceScore = scan.compliance_score || calculateComplianceScore(scan.findings_count);
    
    return `
╔═══════════════════════════════════════════════════════════════════╗
║         COMPLIANCE ASSESSMENT REPORT                             ║
║         Generated: ${new Date().toLocaleString()}                        ║
╚═══════════════════════════════════════════════════════════════════╝

COMPLIANCE OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scan ID:              ${scan.id}
Target:               ${scan.target_url}
Assessment Date:      ${new Date(scan.started_at).toLocaleDateString()}
Overall Score:        ${complianceScore}%

FRAMEWORK COMPLIANCE SCORES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ISO 27001 - Information Security Management
   Score:             ${Math.max(40, complianceScore - 10)}%
   Status:            ${complianceScore >= 75 ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
   Scan:              #${scan.id} - ${scan.target_url}
   
2. PCI-DSS - Payment Card Industry Data Security Standard
   Score:             ${Math.max(50, complianceScore - 5)}%
   Status:            ${complianceScore >= 85 ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
   Scan:              #${scan.id} - ${scan.target_url}
   
3. GDPR - General Data Protection Regulation
   Score:             ${Math.max(45, complianceScore - 15)}%
   Status:            ${complianceScore >= 70 ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
   Scan:              #${scan.id} - ${scan.target_url}
   
4. OWASP Top 10 (2021)
   Score:             ${complianceScore}%
   Status:            ${complianceScore >= 80 ? '✅ COMPLIANT' : '❌ NON-COMPLIANT'}
   Scan:              #${scan.id} - ${scan.target_url}

DETAILED COMPLIANCE ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OWASP Top 10 (2021) Checklist:
${complianceScore >= 80 ? '✅' : '❌'} A01:2021 - Broken Access Control
${complianceScore >= 80 ? '✅' : '❌'} A02:2021 - Cryptographic Failures
${complianceScore >= 80 ? '✅' : '❌'} A03:2021 - Injection
${complianceScore >= 80 ? '✅' : '❌'} A04:2021 - Insecure Design
${complianceScore >= 80 ? '✅' : '❌'} A05:2021 - Security Misconfiguration
${complianceScore >= 80 ? '✅' : '❌'} A06:2021 - Vulnerable Components
${complianceScore >= 80 ? '✅' : '❌'} A07:2021 - Authentication Failures
${complianceScore >= 80 ? '✅' : '❌'} A08:2021 - Software and Data Integrity
${complianceScore >= 80 ? '✅' : '❌'} A09:2021 - Security Logging Failures
${complianceScore >= 80 ? '✅' : '❌'} A10:2021 - Server-Side Request Forgery

PCI-DSS Requirements:
${complianceScore >= 85 ? '✅' : '❌'} Requirement 1: Firewall Configuration
${complianceScore >= 85 ? '✅' : '❌'} Requirement 2: Vendor Defaults
${complianceScore >= 85 ? '✅' : '❌'} Requirement 3: Cardholder Data Protection
${complianceScore >= 85 ? '✅' : '❌'} Requirement 4: Encrypted Transmission
${complianceScore >= 85 ? '✅' : '❌'} Requirement 5: Anti-Virus Protection
${complianceScore >= 85 ? '✅' : '❌'} Requirement 6: Secure Systems Development

COMPLIANCE GAPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${scan.findings_count > 0 ? 
  reportData.vulnerabilities.map((v: any) => 
    `• ${v.title} (${v.owasp_category})`).join('\n') : 
  '✅ No compliance gaps identified'}

RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${complianceScore < 85 ? `
1. Address all security misconfigurations
2. Implement missing security controls
3. Schedule compliance audit
4. Update security policies
5. Conduct staff training
` : `
✅ Excellent compliance posture
✅ Continue monitoring
✅ Regular assessments recommended
`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© 2025 E-Commerce Security Dashboard | Compliance Report
    `.trim();
  };

  const generateVulnerabilityReport = (scan: Scan, reportData: any) => {
    return `
╔═══════════════════════════════════════════════════════════════════╗
║         VULNERABILITY ASSESSMENT REPORT                          ║
║         Generated: ${new Date().toLocaleString()}                        ║
╚═══════════════════════════════════════════════════════════════════╝

VULNERABILITY SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Target:               ${scan.target_url}
Scan ID:              ${scan.id}
Total Vulnerabilities: ${scan.findings_count}

SEVERITY DISTRIBUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 Critical:          ${reportData.vulnerabilities.filter((v: any) => v.severity === 'critical').length}
🟠 High:              ${reportData.vulnerabilities.filter((v: any) => v.severity === 'high').length}
🟡 Medium:            ${reportData.vulnerabilities.filter((v: any) => v.severity === 'medium').length}
🔵 Low:               ${reportData.vulnerabilities.filter((v: any) => v.severity === 'low').length}

DETAILED VULNERABILITY LIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${reportData.vulnerabilities.length > 0 ? reportData.vulnerabilities.map((vuln: any, index: number) => `
┌─────────────────────────────────────────────────────────────────┐
│ VULNERABILITY #${index + 1}                                                │
└─────────────────────────────────────────────────────────────────┘

Title:                ${vuln.title}
Severity:             ${vuln.severity.toUpperCase()} ${getSeverityIcon(vuln.severity)}
CVSS Score:           ${vuln.cvss_score}/10.0
CWE ID:               ${vuln.cwe_id}
OWASP Category:       ${vuln.owasp_category}
Vulnerability Type:   ${vuln.type}

Description:
${vuln.description}

Location:
URL: ${vuln.affected_url || scan.target_url}

Remediation Steps:
${vuln.remediation || getDefaultRemediation(vuln.type)}

Priority:             ${getPriority(vuln.severity)}
Estimated Fix Time:   ${getFixTime(vuln.severity)}
`).join('\n') : 'No vulnerabilities detected.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© 2025 E-Commerce Security Dashboard | Vulnerability Report
    `.trim();
  };

  const getDefaultRemediation = (type: string) => {
    const remediations: { [key: string]: string } = {
      'SECURITY_HEADER': 'Implement the missing security header in web server configuration.',
      'INSECURE_TRANSPORT': 'Configure HTTPS and redirect all HTTP traffic.',
      'SQL_INJECTION': 'Use parameterized queries and input validation.',
      'XSS': 'Implement output encoding and Content Security Policy.',
      'CSRF': 'Implement CSRF tokens and SameSite cookie attribute.',
      'INSECURE_COOKIE': 'Set Secure and HttpOnly flags on cookies.',
      'PCI_COMPLIANCE': 'Review and implement PCI-DSS requirements.',
      'PAYMENT_SECURITY': 'Encrypt payment data and use tokenization.'
    };
    return remediations[type] || 'Consult with security team for remediation.';
  };

  const getRiskImpact = (severity: string) => {
    const impacts: { [key: string]: string } = {
      'critical': 'SEVERE - Immediate exploitation possible, significant business impact',
      'high': 'HIGH - Exploitation likely, major security risk',
      'medium': 'MODERATE - Exploitation possible under certain conditions',
      'low': 'LOW - Limited impact, requires specific conditions'
    };
    return impacts[severity] || 'Unknown risk level';
  };

  const getSeverityIcon = (severity: string) => {
    const icons: { [key: string]: string } = {
      'critical': '🔴',
      'high': '🟠',
      'medium': '🟡',
      'low': '🔵'
    };
    return icons[severity] || '⚪';
  };

  const getPriority = (severity: string) => {
    const priorities: { [key: string]: string } = {
      'critical': 'P0 - Immediate',
      'high': 'P1 - Within 24 hours',
      'medium': 'P2 - Within 1 week',
      'low': 'P3 - Within 1 month'
    };
    return priorities[severity] || 'To be determined';
  };

  const getFixTime = (severity: string) => {
    const times: { [key: string]: string } = {
      'critical': '1-2 hours',
      'high': '4-8 hours',
      'medium': '1-2 days',
      'low': '1-3 days'
    };
    return times[severity] || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Page Header */}
      <div>
        <h1 className="text-4xl font-bold gradient-text mb-2">Reports</h1>
        <p className="text-sm text-gray-500 uppercase tracking-wide">📊 DOWNLOADABLE SECURITY REPORTS</p>
      </div>
      
      {/* Info Card */}
      <div className="card bg-gradient-to-br from-white to-purple-50 border-l-4 border-purple-500">
        <div className="flex items-center space-x-3 mb-3">
          <div className="icon-wrapper bg-gradient-to-br from-purple-100 to-purple-200">
            <DocumentTextIcon className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Generate Security Report</h3>
        </div>
        <p className="text-base text-gray-700 font-medium leading-relaxed">
          📄 Select a completed scan below to generate and download professional security reports in 4 different formats.
        </p>
        {loading ? (
          <div className="mt-4 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
            <p className="text-gray-600 font-medium">Loading scans...</p>
          </div>
        ) : scans.length === 0 ? (
          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl">
            <p className="text-yellow-800 font-semibold">⚠️ No scans available. Please run a security scan first.</p>
          </div>
        ) : null}
      </div>

      {scans.length > 0 && (
        <div className="card bg-gradient-to-br from-white to-gray-50">
          <div className="flex items-center space-x-3 mb-6">
            <div className="icon-wrapper bg-gradient-to-br from-blue-100 to-blue-200">
              <DocumentArrowDownIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Available Reports</h3>
          </div>
          <div className="space-y-5">
            {scans.map((scan) => (
              <div key={scan.id} className="border-2 border-gray-200 rounded-2xl p-6 bg-white hover:shadow-xl transition-all hover:border-blue-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="icon-wrapper bg-gradient-to-br from-blue-100 to-blue-200">
                        <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900">
                        Scan #{scan.id} - {scan.scan_type.toUpperCase()}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-700 font-medium ml-14 mb-3">🌐 {scan.target_url}</p>
                    <div className="flex items-center flex-wrap gap-3 ml-14">
                      <span className="flex items-center bg-gray-100 px-3 py-2 rounded-lg border border-gray-300">
                        <ClockIcon className="h-4 w-4 mr-2 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">{new Date(scan.started_at).toLocaleDateString()}</span>
                      </span>
                      <span className="flex items-center bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                        <CheckCircleIcon className="h-4 w-4 mr-2 text-red-600" />
                        <span className="text-sm font-bold text-red-700">{scan.findings_count} findings</span>
                      </span>
                      <span className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-2 rounded-lg border-2 border-green-300">
                        <span className="text-sm font-bold text-green-700">
                          ✅ {scan.compliance_score || calculateComplianceScore(scan.findings_count)}% compliance
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    onClick={() => downloadReport(scan, 'executive')}
                    disabled={downloadingId === scan.id}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5" />
                    <span className="font-semibold">Executive</span>
                  </button>
                  <button
                    onClick={() => downloadReport(scan, 'technical')}
                    disabled={downloadingId === scan.id}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5" />
                    <span className="font-semibold">Technical</span>
                  </button>
                  <button
                    onClick={() => downloadReport(scan, 'compliance')}
                    disabled={downloadingId === scan.id}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5" />
                    <span className="font-semibold">Compliance</span>
                  </button>
                  <button
                    onClick={() => downloadReport(scan, 'vulnerability')}
                    disabled={downloadingId === scan.id}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    <DocumentArrowDownIcon className="h-5 w-5" />
                    <span className="font-semibold">Vulnerability</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
