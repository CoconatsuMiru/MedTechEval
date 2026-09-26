import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
      <div className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-xl font-bold text-ink-950 mb-1">Your Books</h1>
        <p className="text-sm text-ink-500 mb-6">Enter a new code to unlock a book, or open one you already have.</p>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. MED-8942"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-brand-700"
          />
          <Button type="submit" disabled={unlocking}>{unlocking ? 'Unlocking...' : 'Unlock'}</Button>
        </form>

        {error && (
          <p className="mb-4 text-sm text-status-fail bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}

        {loading && <p className="text-sm text-ink-500">Loading your books...</p>}
        {!loading && books.length === 0 && <p className="text-sm text-ink-500">No books unlocked yet — enter a code above.</p>}

        <div className="grid sm:grid-cols-2 gap-4">
          {books.map(({ books: book }) => (
            <Link
              key={book.id}
              to={`/student/book/${book.code}`}
              className="bg-white border border-slate-200 rounded-lg p-5 hover:border-brand-700 transition-colors"
            >
              <h3 className="font-semibold text-ink-950 mb-1">{book.title}</h3>
              <span className="text-xs font-mono bg-brand-50 text-brand-900 px-2 py-0.5 rounded">{book.code}</span>
            </Link>
          ))}
        </div>

        <Link to="/student/history" className="inline-block mt-6 text-sm text-brand-700 hover:underline">
          View my history →
        </Link>
      </div>
    </div>
  );
}

export default Student;