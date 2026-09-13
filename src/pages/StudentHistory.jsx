import { useState, useEffect } from 'react'
import { useReviewers } from '../context/ReviewerContext'
import TopBar from '../components/TopBar'
import BackLink from '../components/BackLink'

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

  return (
    <div className="min-h-screen bg-app">
      <TopBar roleLabel="Student" />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-ink-950 mb-6">Your Attempt History</h1>

        {loading && <p className="text-sm text-ink-500">Loading your history...</p>}

        {error && (
          <p className="mb-4 text-sm text-status-fail bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {!loading && results.length === 0 && !error && (
          <p className="text-sm text-ink-500">You haven't completed any assessments yet.</p>
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
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-ink-950 truncate">
                    {result.reviewers?.title ?? 'Unknown Reviewer'}
                  </p>
                  <p className="text-xs text-ink-500">
                    {result.reviewers?.code} · {date}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-sm font-medium text-ink-950">
                    {result.score}/{result.total_questions} ({pct}%)
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      passed ? 'bg-status-pass-bg text-status-pass' : 'bg-status-fail-bg text-status-fail'
                    }`}
                  >
                    {passed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6">
          <BackLink to="/student">Back to Student Portal</BackLink>
        </div>
      </div>
    </div>
  );
}

export default StudentHistory;