import { useState, useEffect } from 'react'
import { useReviewers } from '../context/ReviewerContext'
import { useToast } from '../context/ToastContext'
import TopBar from '../components/TopBar'
import EditReviewerModal from '../components/EditReviewerModal'
import CreateReviewerModal from '../components/CreateReviewerModal'

function Teacher() {
  const { fetchTeacherReviewers, deleteReviewer, fetchResultsForReviewer } = useReviewers()
  const { showToast } = useToast()

  const [reviewers, setReviewers] = useState([])
  const [resultsByReviewer, setResultsByReviewer] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [editingReviewer, setEditingReviewer] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const reviewerList = await fetchTeacherReviewers()
      setReviewers(reviewerList)

      const resultsEntries = await Promise.all(
        reviewerList.map(async (r) => [r.id, await fetchResultsForReviewer(r.id)])
      )
      setResultsByReviewer(Object.fromEntries(resultsEntries))
    } catch (err) {
      setError('Could not load your reviewers. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(reviewerId, title) {
    const confirmed = window.confirm(
      `Delete "${title}"? This also removes all its student results. This cannot be undone.`
    )
    if (!confirmed) return

    try {
      await deleteReviewer(reviewerId)
      await loadData()
    } catch (err) {
      alert('Failed to delete reviewer. Please try again.')
      console.error(err)
    }
  }

  function toggleExpanded(reviewerId) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(reviewerId)) {
        next.delete(reviewerId)
      } else {
        next.add(reviewerId)
      }
      return next
    })
  }

  async function handleEditSaved() {
    setEditingReviewer(null)
    await loadData()
  }

  async function handleReviewerCreated(code) {
    setIsCreating(false)
    showToast(`Reviewer published — code ${code}`)
    await loadData()
  }

  const filteredReviewers = reviewers.filter((reviewer) => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return true
    return (
      reviewer.title.toLowerCase().includes(term) ||
      reviewer.code.toLowerCase().includes(term)
    )
  })

  const allResults = Object.values(resultsByReviewer).flat()
  const totalAttempts = allResults.length
  const avgScore =
    totalAttempts === 0
      ? null
      : Math.round(
          allResults.reduce((sum, r) => sum + (r.score / r.total_questions) * 100, 0) / totalAttempts
        )

  return (
    <div className="min-h-screen bg-app">
      <TopBar roleLabel="Teacher" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-ink-950">Your Reviewers</h1>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-brand-900 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Create New Reviewer
          </button>
        </div>

        {!loading && reviewers.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-3">
              <p className="text-2xl font-bold text-ink-950">{reviewers.length}</p>
              <p className="text-xs text-ink-500">Reviewers</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-3">
              <p className="text-2xl font-bold text-ink-950">{totalAttempts}</p>
              <p className="text-xs text-ink-500">Total attempts</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg px-4 py-3">
              <p className="text-2xl font-bold text-ink-950">{avgScore !== null ? `${avgScore}%` : '—'}</p>
              <p className="text-xs text-ink-500">Average score</p>
            </div>
          </div>
        )}

        {!loading && reviewers.length > 0 && (
          <div className="relative mb-5">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 5.4 5.4a7.5 7.5 0 0 0 11.25 11.25Z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or code..."
              className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
          </div>
        )}

        {loading && <p className="text-sm text-ink-500">Loading your reviewers...</p>}

        {error && (
          <p className="mb-4 text-sm text-status-fail bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        {!loading && reviewers.length === 0 && !error && (
          <p className="text-sm text-ink-500">You haven't created any reviewers yet.</p>
        )}

        {!loading && reviewers.length > 0 && filteredReviewers.length === 0 && (
          <p className="text-sm text-ink-500">
            No reviewers match "<span className="font-medium">{searchTerm}</span>".
          </p>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {filteredReviewers.map((reviewer) => {
            const reviewerResults = resultsByReviewer[reviewer.id] ?? []
            const isExpanded = expandedIds.has(reviewer.id)
            const attemptCount = reviewerResults.length
            const avgPct =
              attemptCount === 0
                ? null
                : Math.round(
                    reviewerResults.reduce((sum, r) => sum + (r.score / r.total_questions) * 100, 0) /
                      attemptCount
                  )
            const createdDate = new Date(reviewer.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })

            return (
              <div
                key={reviewer.id}
                className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col"
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink-950 truncate">{reviewer.title}</h3>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {reviewer.questions.length} questions · Created {createdDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <button
                      onClick={() => setEditingReviewer(reviewer)}
                      title="Edit"
                      className="p-1.5 rounded-md text-ink-500 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(reviewer.id, reviewer.title)}
                      title="Delete"
                      className="p-1.5 rounded-md text-ink-500 hover:text-status-fail hover:bg-status-fail-bg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.166L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.166m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>

                <span className="text-xs font-mono bg-brand-50 text-brand-900 px-2 py-0.5 rounded self-start mb-3">
                  {reviewer.code}
                </span>

                <div className="mt-auto border-t border-slate-100 pt-3">
                  {attemptCount === 0 ? (
                    <span className="text-xs text-ink-500 bg-slate-50 border border-slate-200 rounded px-2 py-1">
                      No attempts yet
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleExpanded(reviewer.id)}
                        className="w-full flex items-center justify-between text-sm"
                      >
                        <span className="text-ink-950">
                          <span className="font-medium">{attemptCount}</span> attempt
                          {attemptCount !== 1 ? 's' : ''} · avg{' '}
                          <span className="font-medium">{avgPct}%</span>
                        </span>
                        <svg
                          className={`w-4 h-4 text-ink-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isExpanded && (
                        <ul className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-slate-100">
                          {reviewerResults.map((result) => {
                            const pct = Math.round((result.score / result.total_questions) * 100)
                            const passed = pct >= reviewer.passing_threshold
                            return (
                              <li
                                key={result.id}
                                className="text-sm text-ink-950 flex justify-between items-center"
                              >
                                <span className="truncate">{result.student_name}</span>
                                <span className="flex items-center gap-2 flex-shrink-0 ml-2">
                                  <span className="font-medium">
                                    {result.score}/{result.total_questions} ({pct}%)
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                      passed
                                        ? 'bg-status-pass-bg text-status-pass'
                                        : 'bg-status-fail-bg text-status-fail'
                                    }`}
                                  >
                                    {passed ? 'Passed' : 'Failed'}
                                  </span>
                                </span>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {editingReviewer && (
        <EditReviewerModal
          reviewer={editingReviewer}
          onClose={() => setEditingReviewer(null)}
          onSaved={handleEditSaved}
        />
      )}

      {isCreating && (
        <CreateReviewerModal
          onClose={() => setIsCreating(false)}
          onCreated={handleReviewerCreated}
        />
      )}
    </div>
  );
}

export default Teacher;