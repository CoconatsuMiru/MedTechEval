import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReviewers } from '../context/ReviewerContext'
import { useToast } from '../context/ToastContext'
import TopBar from '../components/TopBar'
import CreateBookModal from '../components/CreateBookModal'

function Teacher() {
  const navigate = useNavigate()
  const { fetchTeacherBooks, deleteBook } = useReviewers()
  const { showToast } = useToast()

  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)

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

  async function handleDelete(bookId, title) {
    const confirmed = window.confirm(`Delete "${title}"? This removes all its chapters and student results. This cannot be undone.`)
    if (!confirmed) return
    try {
      await deleteBook(bookId)
      await loadData()
    } catch (err) {
      alert('Failed to delete book. Please try again.')
      console.error(err)
    }
  }

  function handleBookCreated(book) {
    setIsCreating(false)
    showToast(`Book created — code ${book.code}`)
    loadData()
  }

  const filteredBooks = books.filter((book) => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return true
    return book.title.toLowerCase().includes(term) || book.code.toLowerCase().includes(term)
  })

  return (
    <div className="min-h-screen bg-app">
      <TopBar roleLabel="Teacher" />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-ink-950">Your Books</h1>
          <button onClick={() => setIsCreating(true)} className="bg-brand-900 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + Create New Book
          </button>
        </div>

        {!loading && books.length > 0 && (
          <div className="relative mb-5">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 5.4 5.4a7.5 7.5 0 0 0 11.25 11.25Z" />
            </svg>
            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by title or code..."
              className="w-full border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-700" />
          </div>
        )}

        {loading && <p className="text-sm text-ink-500">Loading your books...</p>}
        {error && <p className="mb-4 text-sm text-status-fail bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">{error}</p>}
        {!loading && books.length === 0 && !error && <p className="text-sm text-ink-500">You haven't created any books yet.</p>}
        {!loading && books.length > 0 && filteredBooks.length === 0 && (
          <p className="text-sm text-ink-500">No books match "<span className="font-medium">{searchTerm}</span>".</p>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {filteredBooks.map((book) => {
            const createdDate = new Date(book.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
            return (
              <div key={book.id} className="bg-white border border-slate-200 rounded-lg p-5 flex flex-col">
                <div className="flex items-start justify-between mb-1">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink-950 truncate">{book.title}</h3>
                    <p className="text-xs text-ink-500 mt-0.5">{book.reviewers.length} chapters · Created {createdDate}</p>
                  </div>
                  <button onClick={() => handleDelete(book.id, book.title)} title="Delete"
                    className="p-1.5 rounded-md text-ink-500 hover:text-status-fail hover:bg-status-fail-bg transition-colors flex-shrink-0 ml-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.166L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.166m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
                <span className="text-xs font-mono bg-brand-50 text-brand-900 px-2 py-0.5 rounded self-start mb-3">{book.code}</span>
                <button onClick={() => navigate(`/teacher/books/${book.id}`)}
                  className="mt-auto text-sm text-brand-700 hover:underline text-left border-t border-slate-100 pt-3">
                  Manage Chapters →
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {isCreating && <CreateBookModal onClose={() => setIsCreating(false)} onCreated={handleBookCreated} />}
    </div>
  );
}

export default Teacher;