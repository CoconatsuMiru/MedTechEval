import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { user, profile, loading, logout } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">MedTechEval</h1>
        <p className="text-slate-600 mb-6">Welcome! Choose your role to continue.</p>

        {!loading && user && (
          <div className="mb-6 text-sm bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
            <p className="text-slate-700">
              Logged in as <strong>{profile?.full_name}</strong> ({profile?.role})
            </p>
            <button onClick={logout} className="text-blue-600 hover:underline mt-1">
              Log out
            </button>
          </div>
        )}

        <div className="flex justify-center gap-4 mb-4">
          <Link
            to="/student"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            I'm a Student
          </Link>
          <Link
            to="/teacher"
            className="bg-slate-800 hover:bg-slate-900 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            I'm a Teacher
          </Link>
        </div>
        <p className="text-sm text-slate-500">
          New here?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Home;