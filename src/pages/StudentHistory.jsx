import { useState, useEffect } from 'react'
import { History, Trophy, Target, CircleAlert } from 'lucide-react'
import { useReviewers } from '../context/ReviewerContext'
import TopBar from '../components/TopBar'
import BackLink from '../components/BackLink'

function StudentHistory() {
  const { fetchStudentResults } = useReviewers()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { loadResults() }, [])

  async function loadResults() {
    setLoading(true); setError('')
    try {
      const data = await fetchStudentResults()
      setResults(data)
    } catch (err) {
      setError('Could not load your history. Please try again.')
      console.error(err)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-app">
      <TopBar roleLabel="Student" />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-4"><BackLink to="/student">Back to Library</BackLink></div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink-950">Attempt History</h1>
            <p className="text-sm text-ink-500">{results.length} attempt{results.length !== 1 ? 's' : ''} so far</p>
          </div>
        </div>

        {loading && <p className="text-sm text-ink-500">Loading your history...</p>}
        {error && (
          <p className="flex items-center gap-2 mb-4 text-sm text-status-fail bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">
            <CircleAlert className="w-4 h-4" /> {error}
          </p>
        )}
        {!loading && results.length === 0 && !error && (
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center bg-white/60">
            <Trophy className="w-8 h-8 text-ink-500 mx-auto mb-2" />
            <p className="text-sm text-ink-500">You haven't completed any assessments yet.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {results.map((result) => {
            const pct = Math.round((result.score / result.total_questions) * 100)
            const passed = pct >= (result.reviewers?.passing_threshold ?? 70)
            const date = new Date(result.completed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

            return (
              <div key={result.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${passed ? 'bg-status-pass-bg text-status-pass' : 'bg-status-fail-bg text-status-fail'}`}>
                  {passed ? <Trophy className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-950 truncate">{result.reviewers?.title ?? 'Unknown Chapter'}</p>
                  <p className="text-xs text-ink-500 truncate">{result.reviewers?.books?.title} · {date}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-ink-950">{pct}%</p>
                  <p className={`text-xs font-medium ${passed ? 'text-status-pass' : 'text-status-fail'}`}>
                    {result.score}/{result.total_questions} · {passed ? 'Passed' : 'Failed'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

export default StudentHistory;