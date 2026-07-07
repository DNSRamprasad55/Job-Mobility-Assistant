import { useState } from 'react';
import { aiAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import Badge from '../components/Badge';

function ResultSection({ title, items, variant = 'default' }) {
  if (!items?.length) return null;
  return (
    <div>
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          variant === 'badge'
            ? <Badge key={i} variant="primary">{item}</Badge>
            : <div key={i} className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg w-full">{item}</div>
        ))}
      </div>
    </div>
  );
}

export default function ResumeAnalyzerPage() {
  const [resumeText, setResumeText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleAnalyze = async () => {
    if (resumeText.length < 50) {
      setError('Please paste at least 50 characters of resume text');
      return;
    }
    setLoading(true);
    setError('');
    setSaved(false);
    try {
      const { data } = await aiAPI.resumeAnalysis(resumeText);
      setResult(data);
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze resume');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resume Analyzer</h1>
        <p className="text-gray-500 mt-1">Paste your resume for AI-powered analysis — results are saved automatically</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {saved && <Alert type="success" message="Analysis complete and saved to your profile!" onClose={() => setSaved(false)} />}

      <div className="card">
        <label className="label">Paste Your Resume</label>
        <textarea
          className="input-field font-mono text-sm"
          rows={12}
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          placeholder="Paste your complete resume text here...

Example:
John Doe
Software Engineer | 3 years experience

Skills: Python, JavaScript, React, FastAPI, SQL
Experience: Built enterprise web applications...
Education: B.Tech Computer Science..."
        />
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-400">{resumeText.length} characters</span>
          <button onClick={handleAnalyze} disabled={loading} className="btn-primary">
            {loading ? 'Analyzing with Gemini AI...' : '📄 Analyze Resume'}
          </button>
        </div>
      </div>

      {loading && <LoadingSpinner text="Gemini AI is analyzing your resume..." />}

      {result && !loading && (
        <div className="card space-y-6 animate-slide-up">
          <h2 className="text-xl font-bold text-gray-900">Analysis Results</h2>

          <ResultSection title="Technical Skills" items={result.technical_skills} variant="badge" />
          <ResultSection title="Soft Skills" items={result.soft_skills} variant="badge" />

          <div className="grid md:grid-cols-2 gap-6">
            <ResultSection title="✅ Strengths" items={result.strengths} />
            <ResultSection title="⚠️ Weaknesses" items={result.weaknesses} />
          </div>

          <ResultSection title="Experience Highlights" items={result.experience} />
          <ResultSection title="Certifications" items={result.certifications} variant="badge" />
          <ResultSection title="Projects" items={result.projects} />

          <div>
            <h4 className="font-semibold text-gray-900 mb-2">💡 Recommendations</h4>
            <div className="space-y-2">
              {result.recommendations?.map((r, i) => (
                <div key={i} className="text-sm text-gray-700 bg-primary-50 border border-primary-100 p-3 rounded-lg">
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
