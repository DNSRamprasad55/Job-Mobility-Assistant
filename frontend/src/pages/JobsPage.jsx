import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Badge from '../components/Badge';

export default function JobsPage() {
  const { isHR } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '', department: '', description: '', required_skills: '', experience: '', location: '',
  });
  const [saving, setSaving] = useState(false);

  const loadJobs = () => {
    jobAPI.getAll()
      .then(({ data }) => setJobs(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadJobs(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await jobAPI.create(form);
      setShowForm(false);
      setForm({ title: '', department: '', description: '', required_skills: '', experience: '', location: '' });
      loadJobs();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create job');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this job posting?')) return;
    try {
      await jobAPI.delete(id);
      loadJobs();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete job');
    }
  };

  if (loading) return <LoadingSpinner text="Loading jobs..." />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Internal Jobs</h1>
          <p className="text-gray-500 mt-1">{jobs.length} opportunities available</p>
        </div>
        {isHR && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ Post New Job'}
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card space-y-4">
          <h3 className="font-semibold text-gray-900">Create Job Posting</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Title</label>
              <input className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label className="label">Department</label>
              <input className="input-field" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required />
            </div>
            <div>
              <label className="label">Experience Required</label>
              <input className="input-field" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input-field" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Description</label>
            <textarea className="input-field" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div>
            <label className="label">Required Skills</label>
            <textarea className="input-field" rows={2} value={form.required_skills} onChange={(e) => setForm({ ...form, required_skills: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Posting...' : 'Post Job'}</button>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="card flex flex-col">
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                <Badge variant="primary">{job.department}</Badge>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">{job.description}</p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                <span>📍 {job.location || 'Not specified'}</span>
                <span>·</span>
                <span>⏱ {job.experience || 'Any'}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <Link to={`/jobs/${job.id}`} className="btn-primary flex-1 text-center text-sm">
                View Details
              </Link>
              {isHR && (
                <button onClick={() => handleDelete(job.id)} className="btn-secondary text-sm text-red-600">
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="text-center py-12 text-gray-500">No jobs posted yet.</div>
      )}
    </div>
  );
}
