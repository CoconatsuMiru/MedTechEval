import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/Button'

function Student() {
  const [code, setCode] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if (code.trim() === '') return
    navigate(`/student/assessment/${code.trim()}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Student Portal</h1>
        <p className="text-slate-600 mb-6">Enter the review code your teacher gave you.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. MED-8942"
            className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit">Enter Assessment Room</Button>
        </form>

        <div className="flex justify-between mt-6 text-sm">
          <Link to="/student/history" className="text-blue-600 hover:underline">
            View My History
          </Link>
          <Link to="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default Student;