import { Link } from 'react-router-dom';

export default function LandingPage() {
  const features = [
    {
      icon: '🎯',
      title: 'AI Job Matching',
      desc: 'Gemini-powered analysis matches your profile with internal opportunities and provides personalized learning plans.',
    },
    {
      icon: '🚀',
      title: 'Career Path Planning',
      desc: 'Discover upward, lateral, and upskill career paths tailored to your skills and aspirations.',
    },
    {
      icon: '📄',
      title: 'Resume Analysis',
      desc: 'Paste your resume and get instant AI-powered insights on strengths, gaps, and recommendations.',
    },
    {
      icon: '📊',
      title: 'HR Analytics',
      desc: 'Comprehensive hiring funnel, department analytics, and top candidate matching for HR teams.',
    },
  ];

  const steps = [
    { step: '01', title: 'Create Profile', desc: 'Register and build your employee profile with skills and experience.' },
    { step: '02', title: 'Explore Jobs', desc: 'Browse internal opportunities across departments and locations.' },
    { step: '03', title: 'AI Analysis', desc: 'Get match scores, gap analysis, and personalized recommendations.' },
    { step: '04', title: 'Apply & Grow', desc: 'Apply with confidence and track your career progression.' },
  ];

  const testimonials = [
    { name: 'Alex Chen', role: 'Software Engineer', text: 'The AI matching helped me discover a perfect lateral move I never considered. Landed my dream role in 3 months!' },
    { name: 'Maria Garcia', role: 'HR Director', text: 'Our internal mobility rate increased 40% since deploying this platform. The analytics dashboard is invaluable.' },
    { name: 'James Wilson', role: 'Data Analyst', text: 'The career planner gave me a clear roadmap. I completed my upskill path and got promoted within a year.' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">JM</div>
              <span className="font-bold text-gray-900">Job Mobility Assistant</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium text-sm px-4 py-2">Login</Link>
              <Link to="/register" className="btn-primary text-sm">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-br from-primary-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            ✨ Powered by Google Gemini AI
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Accelerate Your<br />
            <span className="text-primary-600">Internal Career Growth</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            AI-powered internal job mobility platform that matches your skills with opportunities,
            plans your career path, and analyzes your resume — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary text-base px-8 py-3">Start Your Journey</Link>
            <Link to="/login" className="btn-secondary text-base px-8 py-3">Sign In</Link>
          </div>
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {[
              { val: '500+', label: 'Internal Jobs' },
              { val: '85%', label: 'Match Accuracy' },
              { val: '3x', label: 'Faster Mobility' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-primary-600">{s.val}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful AI Features</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Everything you need for intelligent internal career mobility</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="card animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-600">Four simple steps to your next role</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 bg-primary-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Users Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="card">
                <p className="text-gray-600 text-sm mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-primary-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Career?</h2>
          <p className="text-primary-100 mb-8">Join thousands of employees discovering their next opportunity internally.</p>
          <Link to="/register" className="inline-block bg-white text-primary-600 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors">
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">JM</div>
              <span className="text-white font-semibold">Internal Job Mobility Assistant</span>
            </div>
            <p className="text-sm">&copy; 2024 Job Mobility Assistant. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
