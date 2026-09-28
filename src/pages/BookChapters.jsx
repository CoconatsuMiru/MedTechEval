import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BookOpen, ListChecks, Target, ArrowRight } from 'lucide-react'
import { useReviewers } from '../context/ReviewerContext'
import { MAX_QUESTIONS_PER_ATTEMPT } from '../utils/constants'
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
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center">
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
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-4"><BackLink to="/student">Back to Library</BackLink></div>

        <div className="bg-linear-to-br from-brand-900 to-sky-600 rounded-2xl p-6 text-white shadow-md mb-6 animate-fade-up">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-snug">{book.title}</h1>
              <p className="text-sm text-white/80">{chapters.length} chapter{chapters.length !== 1 ? 's' : ''} · choose one to begin</p>
            </div>
          </div>
        </div>

        {chapters.length === 0 && <p className="text-sm text-ink-500">No chapters have been added to this book yet.</p>}

        <div className="grid sm:grid-cols-2 gap-4">
          {chapters.map((chapter, i) => (
            <button
              key={chapter.id}
              onClick={() => navigate(`/student/assessment/${chapter.id}`)}
              className="group text-left bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-brand-700 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-ink-950 mb-2 leading-snug">{chapter.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-ink-500">
                    <span className="inline-flex items-center gap-1">
                      <ListChecks className="w-3.5 h-3.5" />
                      {Math.min(chapter.questions.length, MAX_QUESTIONS_PER_ATTEMPT)} questions
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" /> Pass {chapter.passing_threshold}%
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-ink-500 group-hover:text-brand-700 group-hover:translate-x-0.5 transition-all mt-1" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BookChapters;