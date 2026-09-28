import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, LogIn, GraduationCap, CircleAlert } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import Button from '../components/Button'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please fill in both fields.')
      return
    }

    setLoading(true)

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    setLoading(false)

    if (profileError || !profile) {
      setError('Logged in, but could not find your profile. Please contact support.')
      return
    }

    navigate(profile.role === 'teacher' ? '/teacher' : '/student')
  }

  return (
    <div className="min-h-screen bg-app flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-lg p-8 animate-fade-up">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-brand-900 to-sky-500 flex items-center justify-center shadow-sm mb-4">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-ink-950 mb-1">Welcome back</h1>
        <p className="text-sm text-ink-500 mb-6">Log in to continue to MedTechEval.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-700"
              />
            </div>
          </div>

          {error && (
            <p className="flex items-start gap-2 text-sm text-status-fail bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">
              <CircleAlert className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            <LogIn className="w-4 h-4" />
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-ink-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-700 font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;