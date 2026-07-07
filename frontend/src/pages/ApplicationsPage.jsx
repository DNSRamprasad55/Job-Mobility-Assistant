import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';
import Alert from '../components/Alert';

export default function ApplicationsPage() {
  const { isHR } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const loadApplications = () => {
    const api = isHR ? applicationAPI.getAll : applicationAPI.getMy;
    api()
      .then(({ data }) => setApplications(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadApplications(); }, [isHR]);

  const handleStatusUpdate = async (id, status) => {
    try {
      await applicationAPI.updateStatus(id, status);
      setMessage({ type: 'success', text: `Status updated to ${status}` });
      loadApplications();
    } catch {
      setMessage({ type: 'error', text: 'Failed to update status' });
    }
  };

  if (loading) return <LoadingSpinner text="Loading applications..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isHR ? 'All Applications' : 'My Applications'}
        </h1>
        <p className="text-gray-500 mt-1">{applications.length} application(s)</p>
      </div>

      {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      {applications.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No applications yet.</p>
          {!isHR && (
            <Link to="/jobs" className="text-primary-600 text-sm mt-2 inline-block hover:underline">
              Browse available jobs →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {app.job?.title || `Job #${app.job_id}`}
                    </h3>
                    <Badge variant={app.status}>{app.status}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {app.job?.department} · Applied {new Date(app.created_at).toLocaleDateString()}
                  </p>
                  {app.match_score > 0 && (
                    <p className="text-sm text-primary-600 font-medium mt-1">
                      AI Match Score: {Math.round(app.match_score)}%
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {!isHR && app.job && (
                    <Link to={`/jobs/${app.job.id}`} className="btn-secondary text-sm">View Job</Link>
                  )}
                  {isHR && (
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                      className="input-field text-sm py-1.5 w-auto"
                    >
                      <option value="applied">Applied</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="offered">Offered</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
