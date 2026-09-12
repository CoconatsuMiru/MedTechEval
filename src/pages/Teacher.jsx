import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useReviewers } from '../context/ReviewerContext'
import { useAuth } from '../context/AuthContext'

function Teacher() {
  const navigate = useNavigate()
  const { profile, logout } = useAuth()
  const { fetchTeacherReviewers, deleteReviewer, fetchResultsForReviewer } = useReviewers()

  const [reviewers, setReviewers] = useState([])
  const [resultsByReviewer, setResultsByReviewer] = useState({}) // { reviewerId: [results] }
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    setError('')
    try {
      const reviewerList = await fetchTeacherReviewers()
      setReviewers(reviewerList)

      // Fetch results for every reviewer in parallel
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
      await loadData() // refresh the list after deleting
    } catch (err) {
      alert('Failed to delete reviewer. Please try again.')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading your reviewers...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-slate-800">Teacher Portal</h1>
          <Link
            to="/teacher/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Create New Reviewer
          </Link>
        </div>
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-500">Logged in as {profile?.full_name}</p>
          <button onClick={logout} className="text-sm text-blue-600 hover:underline">
            Log out
          </button>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Your Reviewers
        </h2>

        {reviewers.length === 0 && !error && (
          <p className="text-sm text-slate-400">You haven't created any reviewers yet.</p>
        )}

        <div className="flex flex-col gap-4">
          {reviewers.map((reviewer) => {
            const reviewerResults = resultsByReviewer[reviewer.id] ?? []
            return (
              <div
                key={reviewer.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-slate-800">{reviewer.title}</h3>
                  <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {reviewer.code}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-3">
                  {reviewer.questions.length} questions
                </p>

                <div className="flex gap-3 mb-3">
                  <button
                    onClick={() => navigate(`/teacher/edit/${reviewer.code}`)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(reviewer.id, reviewer.title)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  {reviewerResults.length === 0 ? (
                    <p className="text-sm text-slate-400">No attempts yet.</p>
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {reviewerResults.map((result) => {
                        const pct = Math.round((result.score / result.total_questions) * 100)
                        const passed = pct >= reviewer.passing_threshold
                        return (
                          <li key={result.id} className="text-sm text-slate-600 flex justify-between items-center">
                            <span>{result.student_name}</span>
                            <span className="flex items-center gap-2">
                              <span className="font-medium">
                                {result.score}/{result.total_questions} ({pct}%)
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
                </div>
              </div>
            )
          })}
        </div>

        <Link to="/" className="inline-block mt-6 text-sm text-blue-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Teacher;