import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  BookOpen, ListChecks, Target, Info, User, Play, CircleCheck, CircleX,
  Sparkles, ChevronDown, ArrowRight, Flag, Tag, Trophy
} from 'lucide-react'
import { useReviewers } from '../context/ReviewerContext'
import { useAuth } from '../context/AuthContext'
import { shuffleArray } from '../utils/shuffle'
import { MAX_QUESTIONS_PER_ATTEMPT } from '../utils/constants'
import Button from '../components/Button'
import TopBar from '../components/TopBar'
import BackLink from '../components/BackLink'

const messagesByTier = {
  high: [
    "Excellent work — that's a strong, confident result.",
    "Outstanding! You clearly know this material well.",
    "Sharp performance. This kind of consistency shows real mastery.",
    "Great job — you're more than ready for the real thing."
  ],
  pass: [
    "Solid pass — nice work getting through this one.",
    "You cleared the bar. A bit more review and you'll be even sharper.",
    "Good result! Worth revisiting the questions you missed to lock it in.",
    "Nice job passing — keep building on this."
  ],
  close: [
    "So close! A little more review and you'll clear it next time.",
    "You're right on the edge — a focused re-read of the misses will help a lot.",
    "Not far off at all. Review the rationale on the ones you missed and try again.",
    "Almost there — this is a great sign you're on the right track."
  ],
  low: [
    "This one's tough material — take some time to review and come back stronger.",
    "Don't worry, everyone starts somewhere. Review the rationale and try again.",
    "This is a learning opportunity, not a verdict. Go over the material and retake it.",
    "Keep going — reviewing your misses now will make the next attempt much easier."
  ]
}

function pickMessage(percentage, passed) {
  let tier
  if (percentage >= 90) tier = 'high'
  else if (passed) tier = 'pass'
  else if (percentage >= 50) tier = 'close'
  else tier = 'low'
  const pool = messagesByTier[tier]
  return pool[Math.floor(Math.random() * pool.length)]
}

function Assessment() {
  const { reviewerId } = useParams()
  const { profile } = useAuth()
  const { fetchReviewerById, recordResult } = useReviewers()

  const [reviewer, setReviewer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [studentName, setStudentName] = useState('')
  const [hasStarted, setHasStarted] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [encouragement, setEncouragement] = useState('')
  const [showBreakdown, setShowBreakdown] = useState(false)

  useEffect(() => { loadReviewer() }, [reviewerId])

  async function loadReviewer() {
    setLoading(true)
    const data = await fetchReviewerById(reviewerId)
    if (!data) {
      setNotFound(true)
    } else {
      setReviewer(data)
      setStudentName(profile?.full_name ?? '')
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="min-h-screen bg-app flex items-center justify-center"><p className="text-sm text-ink-500">Loading assessment...</p></div>
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <h1 className="text-lg font-bold text-ink-950 mb-2">Chapter Not Found</h1>
          <p className="text-sm text-ink-500 mb-4">This chapter may have been removed.</p>
          <BackLink to="/student">Back to Library</BackLink>
        </div>
      </div>
    );
  }

  const attemptSize = Math.min(reviewer.questions.length, MAX_QUESTIONS_PER_ATTEMPT)

  function handleStart() {
    setQuizQuestions(shuffleArray(reviewer.questions).slice(0, MAX_QUESTIONS_PER_ATTEMPT))
    setHasStarted(true)
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-app">
        <TopBar roleLabel="Student" />
        <div className="max-w-lg mx-auto px-4 py-10 animate-fade-up">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
            <div className="bg-linear-to-br from-brand-900 to-sky-600 px-6 py-5 text-white">
              <p className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/15 px-2.5 py-1 rounded-full mb-3">
                <BookOpen className="w-3.5 h-3.5" />
                {reviewer.books?.title}
              </p>
              <h1 className="text-xl font-bold leading-snug">{reviewer.title}</h1>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-950 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                  <ListChecks className="w-4 h-4 text-brand-700" /> {attemptSize} questions
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-950 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                  <Target className="w-4 h-4 text-amber-600" /> Passing score {reviewer.passing_threshold ?? 70}%
                </span>
              </div>

              {reviewer.instructions && (
                <div className="bg-brand-50 border border-blue-100 rounded-xl px-4 py-3 mb-5">
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-900 uppercase tracking-wide mb-1.5">
                    <Info className="w-3.5 h-3.5" /> Instructions
                  </p>
                  <p className="text-sm text-ink-950 whitespace-pre-line leading-relaxed">{reviewer.instructions}</p>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-ink-500 mb-5 pb-5 border-b border-slate-100">
                <User className="w-4 h-4" />
                <span>Starting as</span>
                <span className="font-semibold text-ink-950">{studentName}</span>
              </div>

              <Button onClick={handleStart} className="w-full py-2.5">
                <Play className="w-4 h-4" /> Start Assessment
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const question = quizQuestions[currentIndex]
  const isLastQuestion = currentIndex === quizQuestions.length - 1
  const progressPct = Math.round(((currentIndex + (selectedAnswer ? 1 : 0)) / quizQuestions.length) * 100)

  function handleSelect(choice) {
    if (selectedAnswer) return
    setSelectedAnswer(choice)
    const isCorrect = choice === question.correct_answer
    if (isCorrect) setScore(score + 1)
    setAnswers((prev) => [...prev, { category: question.category ?? 'Uncategorized', correct: isCorrect }])
  }

  async function handleNext() {
    if (isLastQuestion) {
      const finalPercentage = Math.round((score / quizQuestions.length) * 100)
      const finalPassed = finalPercentage >= (reviewer.passing_threshold ?? 70)
      setEncouragement(pickMessage(finalPercentage, finalPassed))
      try {
        await recordResult({ reviewerId: reviewer.id, studentName: studentName.trim(), score, totalQuestions: quizQuestions.length })
      } catch (err) {
        setSaveError('Your score could not be saved, but here are your results.')
        console.error(err)
      }
      setShowResults(true)
    } else {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
    }
  }

  if (showResults) {
    const percentage = Math.round((score / quizQuestions.length) * 100)
    const threshold = reviewer.passing_threshold ?? 70
    const passed = percentage >= threshold

    const categoryStats = {}
    answers.forEach(({ category, correct }) => {
      if (!categoryStats[category]) categoryStats[category] = { correct: 0, total: 0 }
      categoryStats[category].total += 1
      if (correct) categoryStats[category].correct += 1
    })
    const categoryEntries = Object.entries(categoryStats)
      .filter(([cat]) => cat !== 'Uncategorized')
      .map(([category, stats]) => ({ category, pct: Math.round((stats.correct / stats.total) * 100), ...stats }))
      .sort((a, b) => a.pct - b.pct)
    const hasCategories = categoryEntries.length > 0

    return (
      <div className="min-h-screen bg-app">
        <TopBar roleLabel="Student" />
        <div className="max-w-md mx-auto px-4 py-10 animate-fade-up">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-8 text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={passed ? '#16a34a' : '#dc2626'} strokeWidth="10"
                  strokeDasharray={`${(percentage / 100) * 264} 264`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <Trophy className={`w-5 h-5 mb-0.5 ${passed ? 'text-status-pass' : 'text-status-fail'}`} />
                <span className="text-2xl font-bold text-ink-950">{percentage}%</span>
              </div>
            </div>

            <p className="text-sm text-ink-500 mb-1">{reviewer.title}</p>
            <p className="text-ink-950 mb-3">{studentName}, you scored <span className="font-bold">{score}/{quizQuestions.length}</span></p>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium mb-4 ${passed ? 'bg-status-pass-bg text-status-pass' : 'bg-status-fail-bg text-status-fail'}`}>
              {passed ? <CircleCheck className="w-4 h-4" /> : <CircleX className="w-4 h-4" />}
              {passed ? 'Passed' : 'Not Passed'}
            </span>

            {encouragement && (
              <p className="flex items-start gap-2 text-left text-sm text-ink-950 bg-brand-50 border border-blue-100 rounded-xl px-4 py-3 mb-2 leading-relaxed">
                <Sparkles className="w-4 h-4 text-brand-700 mt-0.5 flex-shrink-0" />
                {encouragement}
              </p>
            )}

            {hasCategories && (
              <div className="text-left mt-4 pt-4 border-t border-slate-100">
                <button onClick={() => setShowBreakdown(!showBreakdown)} className="w-full flex items-center justify-between">
                  <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Breakdown by Category</span>
                  <ChevronDown className={`w-4 h-4 text-ink-500 transition-transform ${showBreakdown ? 'rotate-180' : ''}`} />
                </button>
                {showBreakdown && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {categoryEntries.map(({ category, correct, total, pct }) => {
                      const isStrong = pct >= 70
                      const isWeak = pct < 50
                      return (
                        <div key={category} className={`rounded-lg border px-3 py-2 ${isWeak ? 'bg-status-fail-bg border-red-200' : isStrong ? 'bg-status-pass-bg border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                          <p className="text-xs font-medium text-ink-950 truncate mb-0.5">{category}</p>
                          <p className={`text-xs font-semibold ${isWeak ? 'text-status-fail' : isStrong ? 'text-status-pass' : 'text-ink-500'}`}>{correct}/{total} · {pct}%</p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {saveError && <p className="mt-4 text-sm text-status-fail bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">{saveError}</p>}

            <div className="mt-6 flex justify-center">
              <BackLink to="/student">Back to Library</BackLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app">
      <TopBar roleLabel="Student" />
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="flex items-center gap-1.5 text-sm font-semibold text-ink-950 truncate">
            <BookOpen className="w-4 h-4 text-brand-700 flex-shrink-0" />
            <span className="truncate">{reviewer.title}</span>
          </h1>
          <span className="inline-flex items-center gap-1 text-xs font-mono text-ink-500 flex-shrink-0 ml-2">
            <Flag className="w-3.5 h-3.5" /> {currentIndex + 1} / {quizQuestions.length}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2 mb-6 overflow-hidden">
          <div className="bg-linear-to-r from-brand-700 to-sky-500 h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
        </div>

        <div key={currentIndex} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 animate-fade-up">
          {question.category && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-brand-50 text-brand-900 px-2 py-1 rounded-full mb-3">
              <Tag className="w-3 h-3" /> {question.category}
            </span>
          )}
          <h2 className="text-lg font-semibold text-ink-950 mb-4 leading-snug">{question.question}</h2>

          <div className="flex flex-col gap-2 mb-4">
            {question.choices.map((choice, i) => {
              const isSelected = selectedAnswer === choice
              const isCorrectChoice = choice === question.correct_answer
              let styles = "border-slate-200 hover:border-brand-700 hover:bg-brand-50"
              let badge = "bg-slate-100 text-ink-500"
              if (selectedAnswer) {
                if (isCorrectChoice) { styles = "border-status-pass bg-status-pass-bg"; badge = "bg-status-pass text-white" }
                else if (isSelected) { styles = "border-status-fail bg-status-fail-bg"; badge = "bg-status-fail text-white" }
                else { styles = "border-slate-100 opacity-50"; badge = "bg-slate-100 text-ink-500" }
              }
              return (
                <button key={choice} onClick={() => handleSelect(choice)} disabled={!!selectedAnswer}
                  className={`flex items-center gap-3 text-left border rounded-xl px-3 py-2.5 transition-colors ${styles}`}>
                  <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${badge}`}>
                    {selectedAnswer && isCorrectChoice ? <CircleCheck className="w-4 h-4" /> : selectedAnswer && isSelected ? <CircleX className="w-4 h-4" /> : String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm text-ink-950">{choice}</span>
                </button>
              )
            })}
          </div>

          {selectedAnswer && (
            <div className="border-t border-slate-100 pt-4">
              {selectedAnswer === question.correct_answer ? (
                <p className="flex items-center gap-1.5 font-semibold text-status-pass mb-2">
                  <CircleCheck className="w-5 h-5" /> Correct!
                </p>
              ) : (
                <p className="flex items-center gap-1.5 font-semibold text-status-fail mb-2">
                  <CircleX className="w-5 h-5" /> Incorrect. Correct answer: {question.correct_answer}
                </p>
              )}
              <p className="flex items-start gap-2 text-sm text-ink-500 bg-slate-50 rounded-lg px-3 py-2 mb-4">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="italic">{question.rationale}</span>
              </p>
              <Button onClick={handleNext}>
                {isLastQuestion ? 'See Results' : 'Next Question'} <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Assessment;