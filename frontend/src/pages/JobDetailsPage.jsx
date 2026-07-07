import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobAPI, aiAPI, applicationAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Badge from '../components/Badge';

export default function JobDetailsPage() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    jobAPI.getById(id)
      .then(({ data }) => setJob(data))
      .catch(() => setError('Job not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleApplyAndAnalyze = async () => {
    setAnalyzing(true);
    setError('');
    setSuccess('');
    try {
      const { data: matchData } = await aiAPI.jobMatch(parseInt(id));
      setMatchResult(matchData);

      setApplying(true);
      await applicationAPI.apply(parseInt(id));
      setSuccess('Application submitted successfully with AI analysis!');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze and apply');
    } finally {
      setAnalyzing(false);
      setApplying(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading job details..." />;
  if (!job) return <div className="text-center py-12"><p className="text-gray-500">Job not found</p><Link to="/jobs" className="text-primary-600 mt-4 inline-block">← Back to Jobs</Link></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Link to="/jobs" className="text-sm text-primary-600 hover:underline">← Back to Jobs</Link>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <Badge variant="primary">{job.department}</Badge>
              <span>📍 {job.location || 'Not specified'}</span>
              <span>⏱ {job.experience || 'Any experience'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Job Description</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{job.description}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(job.required_skills || '').split(',').filter(Boolean).map((skill, i) => (
                <Badge key={i} variant="default">{skill.trim()}</Badge>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleApplyAndAnalyze}
          disabled={analyzing || applying}
          className="btn-primary mt-6 w-full sm:w-auto"
        >
          {analyzing ? 'Analyzing with Gemini AI...' : applying ? 'Submitting Application...' : 'Apply & Analyze'}
        </button>
      </div>

      {matchResult && (
        <div className="card animate-slide-up">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-600">{Math.round(matchResult.match_score)}%</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Match Result</h2>
              <p className="text-gray-600 text-sm mt-1">{matchResult.summary}</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-700 mb-2">✅ Matching Skills</h4>
              <ul className="space-y-1">
                {matchResult.matching_skills?.map((s, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-orange-700 mb-2">⚠️ Missing Skills</h4>
              <ul className="space-y-1">
                {matchResult.missing_skills?.map((s, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />{s}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-2">💡 Recommendations</h4>
            <ul className="space-y-2">
              {matchResult.recommendations?.map((r, i) => (
                <li key={i} className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{r}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold text-gray-900 mb-2">📚 Weekly Learning Plan</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              {matchResult.weekly_learning_plan?.map((week, i) => (
                <div key={i} className="bg-primary-50 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-primary-700 mb-1">Week {i + 1}</p>
                  <p className="text-sm text-gray-700">{week}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
