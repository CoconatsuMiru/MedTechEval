import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import QuestionCardCarousel from '../components/QuestionCardCarousel'

function Home() {
  const { user, profile, loading, logout } = useAuth()

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="flex-1 grid lg:grid-cols-2">
        {/* Left: content */}
        <div className="flex items-center px-6 sm:px-16 py-16">
          <div className="max-w-md">
            <p className="text-xs font-semibold text-brand-900 bg-brand-50 inline-block px-2 py-1 rounded mb-5">
              Clinical & Technical Assessment Platform
            </p>
            <h1 className="text-5xl font-extrabold text-ink-950 mb-4 leading-[1.05] tracking-tight">
              Know it before it's on the line.
            </h1>
            <p className="text-ink-500 mb-8 leading-relaxed">
              MedTechEval turns your question bank into a structured review — instant
              scoring, cited rationale, and pass/fail thresholds your students can trust.
            </p>

            {!loading && user ? (
              <div className="border border-slate-200 bg-white rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink-950 font-medium">{profile?.full_name}</p>
                  <p className="text-xs text-ink-500 capitalize">{profile?.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={profile?.role === 'teacher' ? '/teacher' : '/student'}
                    className="text-sm font-medium bg-brand-900 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Continue →
                  </Link>
                  <button
                    onClick={logout}
                    className="text-sm font-medium text-ink-500 hover:text-ink-950 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Log out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="bg-brand-900 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium text-brand-900 hover:underline"
                >
                  Create an account
                </Link>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mt-12 pt-6 border-t border-slate-200">
              <div>
                <p className="text-2xl font-bold text-ink-950">100%</p>
                <p className="text-xs text-ink-500">Rationale on every answer</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-ink-950">1</p>
                <p className="text-xs text-ink-500">Code per reviewer</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-ink-950">Auto</p>
                <p className="text-xs text-ink-500">Pass / fail scoring</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: rotating example question cards */}
        <div className="hidden lg:flex items-center justify-center bg-ink-950 px-16 py-16 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          />
          <div className="relative">
            <QuestionCardCarousel />
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-200 px-6 sm:px-16 py-4 text-xs text-ink-500">
        MedTechEval — built for structured clinical review
      </footer>
    </div>
  );
}

export default Home;