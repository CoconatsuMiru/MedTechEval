import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Pencil, Trash2, ChevronDown, ListChecks, Target, Users, BookOpen, CircleAlert } from 'lucide-react'
import { useReviewers } from '../context/ReviewerContext'
import { useToast } from '../context/ToastContext'
import TopBar from '../components/TopBar'
import BackLink from '../components/BackLink'
import EditReviewerModal from '../components/EditReviewerModal'
import CreateChapterModal from '../components/CreateChapterModal'
import ConfirmModal from '../components/ConfirmModal'

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
  const [deletingChapter, setDeletingChapter] = useState(null) // { id, title } or null

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

  async function handleConfirmDelete() {
    await deleteReviewer(deletingChapter.id) // if this throws, ConfirmModal shows the error
    setDeletingChapter(null)
    showToast('Chapter deleted')
    await loadData()
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

        <div className="bg-linear-to-br from-brand-900 to-sky-600 rounded-2xl p-6 text-white shadow-md mb-6 flex items-center justify-between gap-4 animate-fade-up">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-snug">{book?.title ?? 'Book'}</h1>
              {book && <span className="inline-block text-xs font-mono bg-white/15 px-2 py-0.5 rounded mt-1">{book.code}</span>}
            </div>
          </div>
          <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-2 bg-white text-brand-900 hover:bg-blue-50 text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors flex-shrink-0">
            <Plus className="w-4 h-4" /> Add Chapter
          </button>
        </div>

        {error && (
          <p className="flex items-center gap-2 mb-4 text-sm text-status-fail bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">
            <CircleAlert className="w-4 h-4" /> {error}
          </p>
        )}
        {chapters.length === 0 && !error && (
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center bg-white/60">
            <ListChecks className="w-8 h-8 text-ink-500 mx-auto mb-2" />
            <p className="text-sm text-ink-500">No chapters yet — add your first one.</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {chapters.map((chapter, i) => {
            const results = resultsByChapter[chapter.id] ?? []
            const isExpanded = expandedIds.has(chapter.id)
            const attemptCount = results.length
            const avgPct = attemptCount === 0 ? null : Math.round(results.reduce((s, r) => s + (r.score / r.total_questions) * 100, 0) / attemptCount)

            return (
              <div key={chapter.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 font-bold text-sm flex items-center justify-center flex-shrink-0">{i + 1}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-ink-950 leading-snug">{chapter.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-ink-500 mt-1">
                      <span className="inline-flex items-center gap-1"><ListChecks className="w-3.5 h-3.5" />{chapter.questions.length} in bank</span>
                      <span className="inline-flex items-center gap-1"><Target className="w-3.5 h-3.5" />Pass {chapter.passing_threshold}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setEditingChapter(chapter)} title="Edit"
                      className="p-1.5 rounded-md text-ink-500 hover:text-brand-700 hover:bg-brand-50 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeletingChapter({ id: chapter.id, title: chapter.title })} title="Delete"
                      className="p-1.5 rounded-md text-ink-500 hover:text-status-fail hover:bg-status-fail-bg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-auto border-t border-slate-100 pt-3">
                  {attemptCount === 0 ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-ink-500 bg-slate-50 border border-slate-200 rounded px-2 py-1">
                      <Users className="w-3.5 h-3.5" /> No attempts yet
                    </span>
                  ) : (
                    <>
                      <button onClick={() => toggleExpanded(chapter.id)} className="w-full flex items-center justify-between text-sm">
                        <span className="inline-flex items-center gap-1.5 text-ink-950">
                          <Users className="w-4 h-4 text-brand-700" />
                          <span className="font-medium">{attemptCount}</span> attempt{attemptCount !== 1 ? 's' : ''} · avg <span className="font-medium">{avgPct}%</span>
                        </span>
                        <ChevronDown className={`w-4 h-4 text-ink-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
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
      {deletingChapter && (
        <ConfirmModal
          title="Delete this chapter?"
          message={`"${deletingChapter.title}" and all of its student results will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete Chapter"
          busyLabel="Deleting..."
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingChapter(null)}
        />
      )}
    </div>
  );
}

export default ManageBookChapters;