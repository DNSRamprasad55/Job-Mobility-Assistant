import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    designation: '', department: '', experience: '', education: '',
    skills: '', certifications: '', interests: '', summary: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user?.profile) {
      setForm({
        designation: user.profile.designation || '',
        department: user.profile.department || '',
        experience: user.profile.experience || '',
        education: user.profile.education || '',
        skills: user.profile.skills || '',
        certifications: user.profile.certifications || '',
        interests: user.profile.interests || '',
        summary: user.profile.summary || '',
      });
    }
    setLoading(false);
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { data } = await userAPI.updateProfile(form);
      updateUser(data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Employee Profile</h1>
        <p className="text-gray-500 mt-1">Keep your profile updated for better AI matching</p>
      </div>

      {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label">Full Name</label>
            <input className="input-field bg-gray-50" value={user?.fullname || ''} disabled />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input-field bg-gray-50" value={user?.email || ''} disabled />
          </div>
          <div>
            <label className="label">Designation</label>
            <input name="designation" className="input-field" value={form.designation} onChange={handleChange} placeholder="Software Engineer" />
          </div>
          <div>
            <label className="label">Department</label>
            <input name="department" className="input-field" value={form.department} onChange={handleChange} placeholder="Engineering" />
          </div>
          <div>
            <label className="label">Experience</label>
            <input name="experience" className="input-field" value={form.experience} onChange={handleChange} placeholder="3 years" />
          </div>
          <div>
            <label className="label">Education</label>
            <input name="education" className="input-field" value={form.education} onChange={handleChange} placeholder="B.Tech Computer Science" />
          </div>
        </div>
        <div>
          <label className="label">Skills (comma-separated)</label>
          <textarea name="skills" className="input-field" rows={2} value={form.skills} onChange={handleChange} placeholder="Python, React, FastAPI, SQL" />
        </div>
        <div>
          <label className="label">Certifications</label>
          <textarea name="certifications" className="input-field" rows={2} value={form.certifications} onChange={handleChange} />
        </div>
        <div>
          <label className="label">Interests</label>
          <textarea name="interests" className="input-field" rows={2} value={form.interests} onChange={handleChange} />
        </div>
        <div>
          <label className="label">Professional Summary</label>
          <textarea name="summary" className="input-field" rows={3} value={form.summary} onChange={handleChange} />
        </div>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
}
