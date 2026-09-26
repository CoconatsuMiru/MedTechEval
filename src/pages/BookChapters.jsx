import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useReviewers } from '../context/ReviewerContext'
import TopBar from '../components/TopBar'
import BackLink from '../components/BackLink'

function BookChapters() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { fetchBookByCode, fetchChaptersForBook } = useReviewers()

  const [book, setBook] = useState(null)
  const [chapters, setChapters] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => { load() }, [code])

  async function load() {
    setLoading(true)
    const bookData = await fetchBookByCode(code)
    if (!bookData) {
      setNotFound(true)
      setLoading(false)
      return
    }
    setBook(bookData)
    const chapterList = await fetchChaptersForBook(bookData.id)
    setChapters(chapterList)
    setLoading(false)
  }

  if (loading) {
    return <div className="min-h-screen bg-app flex items-center justify-center"><p className="text-sm text-ink-500">Loading...</p></div>
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-8 text-center">
          <h1 className="text-lg font-bold text-ink-950 mb-2">Invalid Code</h1>
          <p className="text-sm text-ink-500 mb-4">No book found for code: <strong className="font-mono">{code}</strong></p>
          <BackLink to="/student">Try a different code</BackLink>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app">
      <TopBar roleLabel="Student" />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-4"><BackLink to="/student">Back to Student Portal</BackLink></div>
        <h1 className="text-xl font-bold text-ink-950 mb-1">{book.title}</h1>
        <p className="text-sm text-ink-500 mb-6">Choose a chapter to begin.</p>

        {chapters.length === 0 && <p className="text-sm text-ink-500">No chapters have been added to this book yet.</p>}

        <div className="grid sm:grid-cols-2 gap-4">
          {chapters.map((chapter) => (
            <button key={chapter.id} onClick={() => navigate(`/student/assessment/${chapter.id}`)}
              className="text-left bg-white border border-slate-200 rounded-lg p-5 hover:border-brand-700 transition-colors">
              <h3 className="font-semibold text-ink-950 mb-1">{chapter.title}</h3>
              <p className="text-xs text-ink-500">{chapter.questions.length} questions · Pass {chapter.passing_threshold}%</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BookChapters;