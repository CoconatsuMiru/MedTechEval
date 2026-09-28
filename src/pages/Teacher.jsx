import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Library, Plus, Search, Trash2, Layers, BookOpen, Copy, Check, ArrowRight, CircleAlert } from 'lucide-react'
import { useReviewers } from '../context/ReviewerContext'
import { useToast } from '../context/ToastContext'
import TopBar from '../components/TopBar'
import CreateBookModal from '../components/CreateBookModal'
import ConfirmModal from '../components/ConfirmModal'

function Teacher() {
  const navigate = useNavigate()
  const { fetchTeacherBooks, deleteBook } = useReviewers()
  const { showToast } = useToast()

  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const [deletingBook, setDeletingBook] = useState(null) // { id, title } or null

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true); setError('')
    try {
      const list = await fetchTeacherBooks()
      setBooks(list)
    } catch (err) {
      setError('Could not load your books. Please try again.')
      console.error(err)
    } finally { setLoading(false) }
  }

  async function handleConfirmDelete() {
    await deleteBook(deletingBook.id) // if this throws, ConfirmModal shows the error
    setDeletingBook(null)
    showToast('Book deleted')
    await loadData()
  }

  function handleBookCreated(book) {
    setIsCreating(false)
    showToast(`Book created — code ${book.code}`)
    loadData()
  }

  async function copyCode(book) {
    try {
      await navigator.clipboard.writeText(book.code)
      setCopiedId(book.id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch (err) { console.error(err) }
  }

  const filteredBooks = books.filter((book) => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return true
    return book.title.toLowerCase().includes(term) || book.code.toLowerCase().includes(term)
  })

  const totalChapters = books.reduce((sum, b) => sum + b.reviewers.length, 0)

  return (
    <div className="min-h-screen bg-app">
      <TopBar roleLabel="Teacher" />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6 animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
              <Library className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-ink-950">Your Books</h1>
              <p className="text-sm text-ink-500">Create books and fill them with chapters.</p>
            </div>
          </div>
          <button onClick={() => setIsCreating(true)} className="inline-flex items-center gap-2 bg-brand-900 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition-colors">
            <Plus className="w-4 h-4" /> Create Book
          </button>
        </div>

        {!loading && books.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center"><BookOpen className="w-5 h-5" /></div>
                <div><p className="text-2xl font-bold text-ink-950 leading-none">{books.length}</p><p className="text-xs text-ink-500 mt-1">Books</p></div>
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Layers className="w-5 h-5" /></div>
                <div><p className="text-2xl font-bold text-ink-950 leading-none">{totalChapters}</p><p className="text-xs text-ink-500 mt-1">Chapters</p></div>
              </div>
            </div>

            <div className="relative mb-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by title or code..."
                className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-700" />
            </div>
          </>
        )}

        {loading && <p className="text-sm text-ink-500">Loading your books...</p>}
        {error && (
          <p className="flex items-center gap-2 mb-4 text-sm text-status-fail bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">
            <CircleAlert className="w-4 h-4" /> {error}
          </p>
        )}
        {!loading && books.length === 0 && !error && (
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center bg-white/60">
            <BookOpen className="w-8 h-8 text-ink-500 mx-auto mb-2" />
            <p className="text-sm text-ink-500">You haven't created any books yet.</p>
          </div>
        )}
        {!loading && books.length > 0 && filteredBooks.length === 0 && (
          <p className="text-sm text-ink-500">No books match "<span className="font-medium">{searchTerm}</span>".</p>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {filteredBooks.map((book) => {
            const createdDate = new Date(book.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            return (
              <div key={book.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-linear-to-br from-brand-900 to-sky-500 flex items-center justify-center shadow-sm flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-ink-950 leading-snug">{book.title}</h3>
                    <p className="text-xs text-ink-500 mt-0.5">{book.reviewers.length} chapters · {createdDate}</p>
                  </div>
                  <button onClick={() => setDeletingBook({ id: book.id, title: book.title })} title="Delete"
                    className="p-1.5 rounded-md text-ink-500 hover:text-status-fail hover:bg-status-fail-bg transition-colors flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <button onClick={() => copyCode(book)} title="Copy code"
                  className="inline-flex items-center gap-1.5 self-start text-xs font-mono bg-brand-50 text-brand-900 hover:bg-blue-100 px-2 py-1 rounded transition-colors mb-3">
                  {copiedId === book.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedId === book.id ? 'Copied' : book.code}
                </button>

                <button onClick={() => navigate(`/teacher/books/${book.id}`)}
                  className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:gap-2 transition-all border-t border-slate-100 pt-3">
                  Manage Chapters <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {isCreating && <CreateBookModal onClose={() => setIsCreating(false)} onCreated={handleBookCreated} />}

      {deletingBook && (
        <ConfirmModal
          title="Delete this book?"
          message={`"${deletingBook.title}" and all of its chapters and student results will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete Book"
          busyLabel="Deleting..."
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingBook(null)}
        />
      )}
    </div>
  );
}

export default Teacher;