import { useState } from 'react';
import { aiAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Badge from '../components/Badge';

function CareerPathCard({ title, icon, color, path }) {
  if (!path) return null;
  const colors = {
    upward: 'border-t-blue-500',
    lateral: 'border-t-purple-500',
    upskill: 'border-t-green-500',
  };

  return (
    <div className={`card border-t-4 ${colors[color]} animate-slide-up`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{icon}</span>
        <div>
          <h3 className="font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-primary-600 font-medium">{path.role}</p>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">{path.reason}</p>

      <div className="space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Required Skills</h4>
          <div className="flex flex-wrap gap-1.5">
            {path.required_skills?.map((s, i) => <Badge key={i} variant="primary">{s}</Badge>)}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Timeline</h4>
          <p className="text-sm font-medium text-gray-900">{path.expected_timeline}</p>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Learning Roadmap</h4>
          <ol className="space-y-1">
            {path.learning_roadmap?.map((step, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-primary-600 font-medium">{i + 1}.</span>{step}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Weekly Plan</h4>
          <div className="grid grid-cols-2 gap-2">
            {path.weekly_plan?.map((week, i) => (
              <div key={i} className="bg-gray-50 p-2 rounded-lg">
                <p className="text-xs font-semibold text-gray-500">W{i + 1}</p>
                <p className="text-xs text-gray-700">{week}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Certifications</h4>
          <div className="flex flex-wrap gap-1.5">
            {path.certifications?.map((c, i) => <Badge key={i} variant="success">{c}</Badge>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CareerPlannerPage() {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generatePlan = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await aiAPI.careerPlan();
      setPlan(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate career plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Career Planner</h1>
          <p className="text-gray-500 mt-1">AI-generated career paths powered by Gemini</p>
        </div>
        <button onClick={generatePlan} disabled={loading} className="btn-primary">
          {loading ? 'Generating with AI...' : '🎯 Generate Career Plan'}
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {loading && <LoadingSpinner text="Gemini AI is analyzing your profile..." />}

      {plan && !loading && (
        <div className="grid lg:grid-cols-3 gap-6">
          <CareerPathCard title="Upward Growth" icon="📈" color="upward" path={plan.upward_path} />
          <CareerPathCard title="Lateral Growth" icon="↔️" color="lateral" path={plan.lateral_path} />
          <CareerPathCard title="Upskill Path" icon="🚀" color="upskill" path={plan.upskill_path} />
        </div>
      )}

      {!plan && !loading && (
        <div className="card text-center py-16">
          <div className="text-5xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Discover Your Career Paths</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Click &ldquo;Generate Career Plan&rdquo; to get personalized upward, lateral, and upskill career paths based on your profile.
          </p>
        </div>
      )}
    </div>
  );
}
