import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function TopBar({ roleLabel }) {
  const { profile, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-900 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div className="leading-tight">
            <p className="font-bold text-ink-950 text-sm">MedTechEval</p>
            {roleLabel && (
              <p className="text-[11px] font-medium text-brand-700 uppercase tracking-wide">
                {roleLabel} Portal
              </p>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <div className="text-right leading-tight hidden sm:block">
            <p className="text-sm font-medium text-ink-950">{profile?.full_name}</p>
            <p className="text-xs text-ink-500 capitalize">{profile?.role}</p>
          </div>
          <button
            onClick={logout}
            className="text-sm font-medium text-ink-500 hover:text-ink-950 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;