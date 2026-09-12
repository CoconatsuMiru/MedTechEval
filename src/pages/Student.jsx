import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Button from '../components/Button'
import TopBar from '../components/TopBar'

function Student() {
  const [code, setCode] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if (code.trim() === '') return
    navigate(`/student/assessment/${code.trim()}`)
  }

  return (
    <div className="min-h-screen bg-app">
      <TopBar roleLabel="Student" />

      <div className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-xl font-bold text-ink-950 mb-1">Enter Review Code</h1>
        <p className="text-sm text-ink-500 mb-6">
          Enter the code your instructor gave you to begin an assessment.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. MED-8942"
            className="border border-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-700"
          />
          <Button type="submit">Enter Assessment Room</Button>
        </form>

        <Link to="/student/history" className="text-sm text-brand-700 hover:underline">
          View my history →
        </Link>
      </div>
    </div>
  );
}

export default Student;