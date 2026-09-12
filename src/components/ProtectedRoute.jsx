import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ allowedRole, children }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRole && profile?.role !== allowedRole) {
    // Logged in, but wrong role for this page — send them to their own portal instead
    return <Navigate to={profile?.role === 'teacher' ? '/teacher' : '/student'} replace />
  }

  return children
}

export default ProtectedRoute;