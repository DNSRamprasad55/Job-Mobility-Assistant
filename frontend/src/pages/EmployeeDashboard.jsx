import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../services/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiAPI.getEmployeeDashboard()
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.fullname?.split(' ')[0]}!</h1>
        <p className="text-gray-500 mt-1">Here&apos;s your career mobility overview</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Available Jobs" value={stats?.available_jobs || 0} color="blue" icon={<span className="text-xl">💼</span>} />
        <StatCard title="Applied Jobs" value={stats?.applied_jobs || 0} color="purple" icon={<span className="text-xl">📋</span>} />
        <StatCard title="Career Score" value={`${stats?.career_score || 0}%`} color="green" icon={<span className="text-xl">🎯</span>} />
        <StatCard title="Recommended" value={stats?.recommended_jobs?.length || 0} color="orange" icon={<span className="text-xl">⭐</span>} subtitle="Jobs for you" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { to: '/profile', label: 'Update Profile', icon: '👤', desc: 'Keep your skills up to date' },
              { to: '/career-planner', label: 'Career Planner', icon: '🎯', desc: 'AI-generated career paths' },
              { to: '/resume-analyzer', label: 'Resume Analyzer', icon: '📄', desc: 'Analyze your resume with AI' },
              { to: '/jobs', label: 'Browse Jobs', icon: '💼', desc: 'Explore internal opportunities' },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all"
              >
                <span className="text-2xl">{action.icon}</span>
                <div>
                  <p className="font-medium text-gray-900">{action.label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Recommended Jobs</h3>
          {stats?.recommended_jobs?.length > 0 ? (
            <div className="space-y-3">
              {stats.recommended_jobs.slice(0, 4).map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
                >
                  <p className="font-medium text-sm text-gray-900">{job.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{job.department} · {job.location}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recommendations yet. Update your profile!</p>
          )}
        </div>
      </div>
    </div>
  );
}
