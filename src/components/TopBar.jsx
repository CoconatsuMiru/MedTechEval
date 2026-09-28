import { Link } from 'react-router-dom'
import { GraduationCap, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function TopBar({ roleLabel }) {
  const { profile, logout } = useAuth()
  const initial = profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-brand-900 to-sky-500 flex items-center justify-center shadow-sm">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <p className="font-bold text-ink-950 text-sm">MedTechEval</p>
            {roleLabel && (
              <p className="text-[11px] font-semibold text-brand-700 uppercase tracking-wide">
                {roleLabel} Portal
              </p>
            )}
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-900 text-sm font-bold flex items-center justify-center">
              {initial}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium text-ink-950">{profile?.full_name}</p>
              <p className="text-xs text-ink-500 capitalize">{profile?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-status-fail border border-slate-200 hover:border-red-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;