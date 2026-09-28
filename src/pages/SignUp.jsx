import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, Mail, Lock, UserPlus, GraduationCap, Presentation, CircleAlert } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import Button from '../components/Button'

function SignUp() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    const userId = data.user?.id
    if (!userId) {
      setError('Something went wrong creating your account. Please try again.')
      setLoading(false)
      return
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: userId, role, full_name: fullName.trim() })

    setLoading(false)

    if (profileError) {
      setError(profileError.message)
      return
    }

    navigate(role === 'teacher' ? '/teacher' : '/student')
  }

  const inputClass = "w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-700"
  const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500"

  const roles = [
    { value: 'student', label: 'Student', icon: GraduationCap, hint: 'Take reviews' },
    { value: 'teacher', label: 'Teacher', icon: Presentation, hint: 'Create books' }
  ]

  return (
    <div className="min-h-screen bg-app flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-lg p-8 animate-fade-up">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-brand-900 to-sky-500 flex items-center justify-center shadow-sm mb-4">
          <UserPlus className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-ink-950 mb-1">Create your account</h1>
        <p className="text-sm text-ink-500 mb-6">Pick your role to get started.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {roles.map(({ value, label, icon: Icon, hint }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`text-left rounded-xl border p-3 transition-all ${
                  role === value
                    ? 'border-brand-700 bg-brand-50 ring-2 ring-brand-700/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1.5 ${role === value ? 'text-brand-700' : 'text-ink-500'}`} />
                <p className="text-sm font-semibold text-ink-950">{label}</p>
                <p className="text-xs text-ink-500">{hint}</p>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <div className="relative">
              <User className={iconClass} />
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <div className="relative">
              <Mail className={iconClass} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className={iconClass} />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
            </div>
          </div>

          {error && (
            <p className="flex items-start gap-2 text-sm text-status-fail bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">
              <CircleAlert className="w-4 h-4 mt-0.5 flex-shrink-0" /> {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            <UserPlus className="w-4 h-4" />
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <p className="mt-6 text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-700 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;