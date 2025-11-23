import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircleIcon, ExclamationCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

interface Scan {
  id: number;
  scan_type: string;
  target_url: string;
  started_at: string;
  findings_count: number;
  compliance_score: number;
  status: string;
}

const Compliance = () => {
  const [scans, setScans] = useState<Scan[]>([]);
  const [loading, setLoading] = useState(true);

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

  const calculateComplianceScore = (findingsCount: number) => {
    if (findingsCount === 0) return 100;
    if (findingsCount <= 2) return 95;
    if (findingsCount <= 5) return 85;
    if (findingsCount <= 10) return 75;
    return Math.max(50, 100 - (findingsCount * 5));
  };

  const getFrameworkScores = (scan: Scan) => {
    const baseScore = scan.compliance_score || calculateComplianceScore(scan.findings_count);
    return [
      { 
        name: 'ISO 27001', 
        fullName: 'Information Security Management',
        score: Math.max(40, baseScore - 10), 
        description: 'International standard for information security management systems'
      },
      { 
        name: 'PCI-DSS', 
        fullName: 'Payment Card Industry Data Security Standard',
        score: Math.max(50, baseScore - 5), 
        description: 'Security standards for organizations handling credit card information'
      },
      { 
        name: 'GDPR', 
        fullName: 'General Data Protection Regulation',
        score: Math.max(45, baseScore - 15), 
        description: 'EU regulation for data protection and privacy'
      },
      { 
        name: 'OWASP Top 10', 
        fullName: 'Open Web Application Security Project',
        score: baseScore, 
        description: 'Top 10 web application security risks'
      },
    ];
  };

  const getStatusInfo = (score: number) => {
    if (score >= 90) return { status: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircleIcon };
    if (score >= 75) return { status: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: CheckCircleIcon };
    if (score >= 60) return { status: 'Needs Improvement', color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: ExclamationCircleIcon };
    return { status: 'Critical', color: 'text-red-600', bgColor: 'bg-red-100', icon: ExclamationCircleIcon };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Compliance Framework Scores</h2>
      </div>

      {loading ? (
        <div className="card">
          <p className="text-gray-500">Loading compliance data...</p>
        </div>
      ) : scans.length === 0 ? (
        <div className="card">
          <p className="text-gray-500">No scans available. Run a security scan to see compliance scores.</p>
        </div>
      ) : (
        scans.map((scan) => {
          const frameworks = getFrameworkScores(scan);
          
          return (
            <div key={scan.id} className="space-y-4">
              <div className="card bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Scan #{scan.id} - {scan.scan_type.toUpperCase()} Security Scan
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{scan.target_url}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500 flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        {new Date(scan.started_at).toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {scan.findings_count} vulnerabilities found
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      {scan.compliance_score || calculateComplianceScore(scan.findings_count)}%
                    </div>
                    <p className="text-sm text-gray-600">Overall Compliance</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {frameworks.map((framework) => {
                  const statusInfo = getStatusInfo(framework.score);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <div key={framework.name} className="card hover:shadow-lg transition">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {framework.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {framework.fullName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {framework.description}
                          </p>
                        </div>
                        <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
                      </div>

                      <div className="mb-3">
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-gray-600">Compliance Score</span>
                          <span className="font-semibold text-gray-900">{framework.score}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${
                              framework.score >= 90 ? 'bg-green-500' :
                              framework.score >= 75 ? 'bg-blue-500' :
                              framework.score >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${framework.score}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="border-t pt-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}>
                              {statusInfo.status}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Based on Scan #{scan.id}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          <strong>Target:</strong> {scan.target_url}
                        </div>
                        <div className="text-xs text-gray-600">
                          <strong>Date:</strong> {new Date(scan.started_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="card bg-gray-50">
                <h4 className="font-semibold text-gray-900 mb-3">Compliance Summary for Scan #{scan.id}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {frameworks.map((framework) => (
                    <div key={framework.name} className="text-center">
                      <div className={`text-2xl font-bold ${
                        framework.score >= 90 ? 'text-green-600' :
                        framework.score >= 75 ? 'text-blue-600' :
                        framework.score >= 60 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {framework.score}%
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{framework.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Compliance;
