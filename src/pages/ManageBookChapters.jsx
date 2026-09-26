import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useReviewers } from '../context/ReviewerContext'
import { useToast } from '../context/ToastContext'
import TopBar from '../components/TopBar'
import BackLink from '../components/BackLink'
import EditReviewerModal from '../components/EditReviewerModal'
import CreateChapterModal from '../components/CreateChapterModal'

function ManageBookChapters() {
  const { bookId } = useParams()
  const { fetchChaptersForBook, deleteReviewer, fetchResultsForReviewer, fetchTeacherBooks } = useReviewers()
  const { showToast } = useToast()

  const [book, setBook] = useState(null)
  const [chapters, setChapters] = useState([])
  const [resultsByChapter, setResultsByChapter] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [editingChapter, setEditingChapter] = useState(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => { loadData() }, [bookId])

  async function loadData() {
    setLoading(true); setError('')
    try {
      const books = await fetchTeacherBooks()
      setBook(books.find((b) => b.id === bookId) ?? null)

      const chapterList = await fetchChaptersForBook(bookId)
      setChapters(chapterList)

      const entries = await Promise.all(chapterList.map(async (c) => [c.id, await fetchResultsForReviewer(c.id)]))
      setResultsByChapter(Object.fromEntries(entries))
    } catch (err) {
      setError('Could not load this book. Please try again.')
      console.error(err)
    } finally { setLoading(false) }
  }

  async function handleDelete(chapterId, title) {
    const confirmed = window.confirm(`Delete "${title}"? This also removes its student results. This cannot be undone.`)
    if (!confirmed) return
    try {
      await deleteReviewer(chapterId)
      await loadData()
    } catch (err) {
      alert('Failed to delete chapter. Please try again.')
      console.error(err)
    }
  }

  function toggleExpanded(id) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function handleEditSaved() { setEditingChapter(null); await loadData() }
  async function handleChapterCreated() {
    setIsCreating(false)
    showToast('Chapter published')
    await loadData()
  }

  if (loading) {
    return <div className="min-h-screen bg-app flex items-center justify-center"><p className="text-sm text-ink-500">Loading...</p></div>
  }

  return (
    <div className="min-h-screen bg-app">
      <TopBar roleLabel="Teacher" />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-4"><BackLink to="/teacher">Back to Books</BackLink></div>

        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold text-ink-950">{book?.title ?? 'Book'}</h1>
          <button onClick={() => setIsCreating(true)} className="bg-brand-900 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + Add Chapter
          </button>
        </div>
        {book && <span className="text-xs font-mono bg-brand-50 text-brand-900 px-2 py-0.5 rounded inline-block mb-6">{book.code}</span>}

        {error && <p className="mb-4 text-sm text-status-fail bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        {chapters.length === 0 && !error && <p className="text-sm text-ink-500">No chapters yet — add your first one.</p>}

        <div className="grid sm:grid-cols-2 gap-4">
          {chapters.map((chapter) => {
            const results = resultsByChapter[chapter.id] ?? []
            const isExpanded = expandedIds.has(chapter.id)
            const attemptCount = results.length
            const avgPct = attemptCount === 0 ? null : Math.round(results.reduce((s, r) => s + (r.score / r.total_questions) * 100, 0) / attemptCount)

            return (
              <div key={chapter.id} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col">
                <div className="flex items-start justify-between mb-1">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink-950 truncate">{chapter.title}</h3>
                    <p className="text-xs text-ink-500 mt-0.5">{chapter.questions.length} questions · Pass {chapter.passing_threshold}%</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <button onClick={() => setEditingChapter(chapter)} title="Edit"
                      className="p-1.5 rounded-md text-ink-500 hover:text-brand-700 hover:bg-brand-50 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(chapter.id, chapter.title)} title="Delete"
                      className="p-1.5 rounded-md text-ink-500 hover:text-status-fail hover:bg-status-fail-bg transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.166L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.166m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mt-auto border-t border-slate-100 pt-3">
                  {attemptCount === 0 ? (
                    <span className="text-xs text-ink-500 bg-slate-50 border border-slate-200 rounded px-2 py-1">No attempts yet</span>
                  ) : (
                    <>
                      <button onClick={() => toggleExpanded(chapter.id)} className="w-full flex items-center justify-between text-sm">
                        <span className="text-ink-950"><span className="font-medium">{attemptCount}</span> attempt{attemptCount !== 1 ? 's' : ''} · avg <span className="font-medium">{avgPct}%</span></span>
                        <svg className={`w-4 h-4 text-ink-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isExpanded && (
                        <ul className="flex flex-col gap-1.5 mt-3 pt-3 border-t border-slate-100">
                          {results.map((result) => {
                            const pct = Math.round((result.score / result.total_questions) * 100)
                            const passed = pct >= chapter.passing_threshold
                            return (
                              <li key={result.id} className="text-sm text-ink-950 flex justify-between items-center">
                                <span className="truncate">{result.student_name}</span>
                                <span className="flex items-center gap-2 flex-shrink-0 ml-2">
                                  <span className="font-medium">{result.score}/{result.total_questions} ({pct}%)</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${passed ? 'bg-status-pass-bg text-status-pass' : 'bg-status-fail-bg text-status-fail'}`}>
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

      {editingChapter && (
        <EditReviewerModal reviewer={editingChapter} onClose={() => setEditingChapter(null)} onSaved={handleEditSaved} />
      )}
      {isCreating && (
        <CreateChapterModal bookId={bookId} onClose={() => setIsCreating(false)} onCreated={handleChapterCreated} />
      )}
    </div>
  );
}

export default ManageBookChapters;