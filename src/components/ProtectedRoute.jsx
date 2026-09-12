import { useEffect, useRef } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function ProtectedRoute({ allowedRole, children }) {
  const { user, profile, loading } = useAuth()
  const { showToast } = useToast()
  const hasShownToast = useRef(false)

  const wrongRole = !loading && user && allowedRole && profile?.role !== allowedRole

  useEffect(() => {
    if (wrongRole && !hasShownToast.current) {
      const label = allowedRole === 'teacher' ? 'Teachers only' : 'Students only'
      showToast(label)
      hasShownToast.current = true
    }
  }, [wrongRole])

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

  if (wrongRole) {
    return <Navigate to={profile?.role === 'teacher' ? '/teacher' : '/student'} replace />
  }

  return children
}

export default ProtectedRoute;