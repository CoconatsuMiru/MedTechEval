import { Link } from 'react-router-dom'
import { Stethoscope, ListChecks, KeyRound, Target, LogIn, UserPlus, ArrowRight, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import QuestionCardCarousel from '../components/QuestionCardCarousel'

const features = [
  { icon: ListChecks, title: 'Rationale on every answer', text: 'Students learn why, not just what.', tile: 'bg-emerald-50 text-emerald-600' },
  { icon: KeyRound, title: 'One code per book', text: 'Unlock once, keep every new chapter.', tile: 'bg-sky-50 text-sky-600' },
  { icon: Target, title: 'Auto pass / fail', text: 'A passing score for every chapter.', tile: 'bg-amber-50 text-amber-600' }
]

function Home() {
  const { user, profile, loading, logout } = useAuth()

  return (
    <div className="min-h-screen bg-app flex flex-col">
      <div className="flex-1 grid lg:grid-cols-2">
        <div className="flex items-center px-6 sm:px-16 py-16">
          <div className="max-w-md animate-fade-up">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-900 bg-brand-50 border border-blue-100 px-2.5 py-1 rounded-full mb-5">
              <Stethoscope className="w-3.5 h-3.5" />
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
              <div className="border border-slate-200 bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-900 font-bold flex items-center justify-center">
                    {profile?.full_name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-ink-950 font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-ink-500 capitalize">{profile?.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={profile?.role === 'teacher' ? '/teacher' : '/student'}
                    className="inline-flex items-center gap-1.5 text-sm font-medium bg-brand-900 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={logout}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-status-fail border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Log out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-brand-900 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors"
                >
                  <LogIn className="w-4 h-4" /> Log In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand-900 bg-white border border-slate-200 hover:border-brand-700 px-5 py-2.5 rounded-lg transition-colors"
                >
                  <UserPlus className="w-4 h-4" /> Create an account
                </Link>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-10 pt-6 border-t border-slate-200">
              {features.map(({ icon: Icon, title, text, tile }) => (
                <div key={title} className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tile}`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink-950">{title}</p>
                    <p className="text-xs text-ink-500">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

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