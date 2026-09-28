import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-950 bg-white border border-slate-200 rounded-lg px-3 py-1.5 hover:border-brand-700 hover:text-brand-700 transition-colors"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      {children}
    </Link>
  );
}

export default BackLink;