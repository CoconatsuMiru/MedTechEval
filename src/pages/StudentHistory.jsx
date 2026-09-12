import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useReviewers } from '../context/ReviewerContext'

function StudentHistory() {
  const { fetchStudentResults } = useReviewers()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadResults()
  }, [])

  async function loadResults() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchStudentResults()
      setResults(data)
    } catch (err) {
      setError('Could not load your history. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading your history...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Your Attempt History</h1>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {results.length === 0 && !error && (
          <p className="text-sm text-slate-400">You haven't completed any assessments yet.</p>
        )}

        <div className="flex flex-col gap-3">
          {results.map((result) => {
            const pct = Math.round((result.score / result.total_questions) * 100)
            const threshold = result.reviewers?.passing_threshold ?? 70
            const passed = pct >= threshold
            const date = new Date(result.completed_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })

            return (
              <div
                key={result.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-800">
                    {result.reviewers?.title ?? 'Unknown Reviewer'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {result.reviewers?.code} • {date}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    {result.score}/{result.total_questions} ({pct}%)
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <Link to="/student" className="inline-block mt-6 text-sm text-blue-600 hover:underline">
          ← Back to Student Portal
        </Link>
      </div>
    </div>
  );
}

export default StudentHistory;