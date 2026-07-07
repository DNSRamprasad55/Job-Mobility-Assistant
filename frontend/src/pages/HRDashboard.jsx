import { useEffect, useState } from 'react';
import { aiAPI } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function HRDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiAPI.getAnalytics()
      .then(({ data }) => setAnalytics(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading HR dashboard..." />;

  const deptData = Object.entries(analytics?.applications_by_department || {}).map(([name, value]) => ({
    name, value,
  }));

  const funnelData = Object.entries(analytics?.hiring_funnel || {}).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1), value,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
        <p className="text-gray-500 mt-1">Hiring overview and analytics</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Total Jobs" value={analytics?.total_jobs || 0} color="blue" icon={<span className="text-xl">💼</span>} />
        <StatCard title="Applications" value={analytics?.total_applications || 0} color="purple" icon={<span className="text-xl">📋</span>} />
        <StatCard title="Shortlisted" value={analytics?.shortlisted || 0} color="green" icon={<span className="text-xl">✅</span>} />
        <StatCard title="Offered" value={analytics?.offered || 0} color="orange" icon={<span className="text-xl">🎉</span>} />
        <StatCard title="Rejected" value={analytics?.rejected || 0} color="red" icon={<span className="text-xl">❌</span>} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-6">Applications by Department</h3>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 text-center py-12">No application data yet</p>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-6">Hiring Funnel</h3>
          {funnelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={funnelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {funnelData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 text-center py-12">No funnel data yet</p>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Top Matching Candidates</h3>
        {analytics?.top_candidates?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Candidate</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Job</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Match Score</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {analytics.top_candidates.map((c, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{c.employee_name}</td>
                    <td className="py-3 px-4 text-gray-600">{c.job_title}</td>
                    <td className="py-3 px-4">
                      <span className="text-primary-600 font-semibold">{c.match_score}%</span>
                    </td>
                    <td className="py-3 px-4 capitalize">{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No candidates yet</p>
        )}
      </div>
    </div>
  );
}
