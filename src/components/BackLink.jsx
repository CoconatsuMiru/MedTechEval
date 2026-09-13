import { Link } from 'react-router-dom'

function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-950 bg-white border border-slate-200 rounded-lg px-3 py-1.5 hover:border-slate-300 hover:bg-slate-50 transition-colors"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      {children}
    </Link>
  );
}

export default BackLink;