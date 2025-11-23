import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const severityColors: { [key: string]: string } = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#f59e0b',
    low: '#3b82f6',
    info: '#6b7280',
  };

  const vulnData = stats?.vulnerabilitiesBySeverity?.map((item: any) => ({
    name: item.severity.charAt(0).toUpperCase() + item.severity.slice(1),
    value: parseInt(item.count),
    color: severityColors[item.severity] || '#6b7280',
  })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold gradient-text">Security Dashboard</h1>
          <p className="text-gray-600 mt-2">Real-time e-commerce security monitoring</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card stat-card-danger">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Vulnerabilities</p>
              <p className="text-4xl font-bold text-gray-900 mt-3">
                {stats?.totalVulnerabilities || 0}
              </p>
              <p className="text-sm text-red-600 font-medium mt-2 flex items-center">
                <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                {stats?.criticalIssues || 0} critical issues
              </p>
            </div>
            <div className="icon-wrapper bg-gradient-to-br from-red-100 to-red-200">
              <ExclamationTriangleIcon className="h-7 w-7 text-red-600" />
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-primary">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Security Score</p>
              <p className="text-4xl font-bold text-gray-900 mt-3">
                {stats?.securityScore || 0}
                <span className="text-xl text-gray-500">/100</span>
              </p>
              <p className="text-sm text-blue-600 font-medium mt-2 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Overall assessment
              </p>
            </div>
            <div className="icon-wrapper bg-gradient-to-br from-blue-100 to-blue-200">
              <ShieldCheckIcon className="h-7 w-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Compliance Score</p>
              <p className="text-4xl font-bold text-gray-900 mt-3">
                {stats?.complianceScore || 0}%
              </p>
              <p className="text-sm text-green-600 font-medium mt-2 flex items-center">
                <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
                All frameworks
              </p>
            </div>
            <div className="icon-wrapper bg-gradient-to-br from-green-100 to-green-200">
              <CheckCircleIcon className="h-7 w-7 text-green-600" />
            </div>
          </div>
        </div>

        <div className="stat-card stat-card-warning">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Total Scans</p>
              <p className="text-4xl font-bold text-gray-900 mt-3">
                {stats?.totalScans || 0}
              </p>
              <p className="text-sm text-purple-600 font-medium mt-2 flex items-center">
                <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
                Completed scans
              </p>
            </div>
            <div className="icon-wrapper bg-gradient-to-br from-purple-100 to-purple-200">
              <ClockIcon className="h-7 w-7 text-purple-600" />
            </div>
            <ClockIcon className="h-12 w-12 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vulnerability Distribution */}
        <div className="card bg-gradient-to-br from-white to-red-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              🔍 Vulnerability Distribution
            </h3>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              BY SEVERITY
            </span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={vulnData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={110}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {vulnData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Compliance Scores */}
        <div className="card bg-gradient-to-br from-white to-blue-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              ✅ Compliance Framework Scores
            </h3>
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              PERCENTAGE
            </span>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={stats?.compliance || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="framework" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="avg_score" fill="#3b82f6" name="Compliance Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.recentActivity?.map((activity: any, index: number) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.action}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.username || 'System'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`badge ${
                        activity.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : activity.status === 'failure'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {activity.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(activity.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
