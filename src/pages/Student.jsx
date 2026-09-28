import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { KeyRound, Library, BookOpen, ArrowRight, History, CircleAlert, LockOpen } from 'lucide-react'
import { useReviewers } from '../context/ReviewerContext'
import Button from '../components/Button'
import TopBar from '../components/TopBar'

function Student() {
  const navigate = useNavigate()
  const { unlockBook, fetchStudentBooks } = useReviewers()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadBooks() }, [])

  async function loadBooks() {
    setLoading(true)
    try {
      const data = await fetchStudentBooks()
      setBooks(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!code.trim()) return
    setUnlocking(true)
    setError('')
    try {
      const book = await unlockBook(code.trim())
      if (!book) {
        setError('No book found with that code.')
      } else {
        navigate(`/student/book/${book.code}`)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setUnlocking(false)
    }
  }

  return (
    <div className="min-h-screen bg-app">
      <TopBar roleLabel="Student" />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6 animate-fade-up">
          <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
            <Library className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-ink-950">Your Library</h1>
            <p className="text-sm text-ink-500">Unlock a book with a code, then keep it forever.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-2">
          <div className="relative flex-1">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter book code, e.g. MED-8942"
              className="w-full border border-slate-300 bg-white rounded-lg pl-9 pr-3 py-2.5 font-mono focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
          </div>
          <Button type="submit" disabled={unlocking}>
            <LockOpen className="w-4 h-4" />
            {unlocking ? 'Unlocking...' : 'Unlock'}
          </Button>
        </form>

        {error && (
          <p className="flex items-center gap-2 mt-2 text-sm text-status-fail bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">
            <CircleAlert className="w-4 h-4 flex-shrink-0" /> {error}
          </p>
        )}

        <h2 className="text-xs font-semibold text-ink-500 uppercase tracking-wide mt-8 mb-3">My Books</h2>

        {loading && <p className="text-sm text-ink-500">Loading your books...</p>}

        {!loading && books.length === 0 && (
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center bg-white/60">
            <BookOpen className="w-8 h-8 text-ink-500 mx-auto mb-2" />
            <p className="text-sm text-ink-500">No books yet — enter a code above to unlock your first one.</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          {books.map(({ books: book }) => (
            <Link
              key={book.id}
              to={`/student/book/${book.code}`}
              className="group bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-brand-700 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-linear-to-br from-brand-900 to-sky-500 flex items-center justify-center mb-3 shadow-sm">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-ink-950 mb-2 leading-snug">{book.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono bg-brand-50 text-brand-900 px-2 py-0.5 rounded">{book.code}</span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 group-hover:gap-2 transition-all">
                  Open <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <Link to="/student/history" className="inline-flex items-center gap-2 mt-8 text-sm font-medium text-brand-700 hover:underline">
          <History className="w-4 h-4" /> View my history
        </Link>
      </div>
    </div>
  );
}

export default Student;