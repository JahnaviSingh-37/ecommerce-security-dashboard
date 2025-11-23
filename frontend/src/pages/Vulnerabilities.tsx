import { useState, useEffect } from 'react';
import axios from 'axios';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const Vulnerabilities = () => {
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVulnerabilities();
  }, []);

  const fetchVulnerabilities = async () => {
    try {
      const response = await axios.get('/api/vulnerabilities');
      setVulnerabilities(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch vulnerabilities', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200',
    };
    return colors[severity] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold gradient-text mb-2">Vulnerabilities</h1>
          <p className="text-sm text-gray-500 uppercase tracking-wide">⚠️ SECURITY THREAT ANALYSIS</p>
        </div>
        <div className="stat-card stat-card-danger px-6 py-3 inline-block">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Total Threats</p>
          <p className="text-3xl font-bold text-red-600">{vulnerabilities.length}</p>
        </div>
      </div>

      {vulnerabilities.length > 0 ? (
        <div className="space-y-4">
          {vulnerabilities.map((vuln) => (
            <div key={vuln.id} className="card bg-gradient-to-br from-white to-gray-50 hover:shadow-2xl transition-all border-l-4 ${
              vuln.severity === 'critical' ? 'border-red-500' :
              vuln.severity === 'high' ? 'border-orange-500' :
              vuln.severity === 'medium' ? 'border-yellow-500' :
              'border-blue-500'
            }">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-3">
                    <div className={`icon-wrapper ${
                      vuln.severity === 'critical' ? 'bg-gradient-to-br from-red-100 to-red-200' :
                      vuln.severity === 'high' ? 'bg-gradient-to-br from-orange-100 to-orange-200' :
                      vuln.severity === 'medium' ? 'bg-gradient-to-br from-yellow-100 to-yellow-200' :
                      'bg-gradient-to-br from-blue-100 to-blue-200'
                    }`}>
                      <ExclamationTriangleIcon className={`h-7 w-7 ${
                        vuln.severity === 'critical' ? 'text-red-600' :
                        vuln.severity === 'high' ? 'text-orange-600' :
                        vuln.severity === 'medium' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{vuln.title}</h3>
                  </div>
                  
                  <p className="text-gray-700 mb-4 leading-relaxed bg-gray-50 p-3 rounded-lg border-l-2 border-gray-300">{vuln.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold border-2 shadow-sm ${getSeverityColor(vuln.severity)}`}>
                      🔥 {vuln.severity.toUpperCase()}
                    </span>
                    {vuln.cvss_score && (
                      <span className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-2 border-gray-300 shadow-sm">
                        📊 CVSS: {vuln.cvss_score}
                      </span>
                    )}
                    {vuln.cwe_id && (
                      <span className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-2 border-purple-300 shadow-sm">
                        🔖 {vuln.cwe_id}
                      </span>
                    )}
                    {vuln.owasp_category && (
                      <span className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-100 to-indigo-200 text-indigo-800 border-2 border-indigo-300 shadow-sm">
                        🛡️ {vuln.owasp_category}
                      </span>
                    )}
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold border-2 shadow-sm ${
                      vuln.status === 'resolved' ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300' :
                      vuln.status === 'in_progress' ? 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300' :
                      'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300'
                    }`}>
                      {vuln.status === 'resolved' ? '✅' : vuln.status === 'in_progress' ? '⏳' : '❌'} {vuln.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card bg-gradient-to-br from-white to-green-50 text-center py-16 border-2 border-dashed border-green-300">
          <div className="icon-wrapper bg-gradient-to-br from-green-100 to-green-200 h-20 w-20 mx-auto mb-6">
            <ExclamationTriangleIcon className="h-12 w-12 text-green-600" />
          </div>
          <p className="text-gray-900 text-2xl font-bold mb-2">✅ No vulnerabilities detected yet</p>
          <p className="text-gray-600 text-base">Run a security scan to find potential vulnerabilities</p>
        </div>
      )}
    </div>
  );
};

export default Vulnerabilities;
