import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useReviewers } from '../context/ReviewerContext'
import { useAuth } from '../context/AuthContext'
import { shuffleArray } from '../utils/shuffle'
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
  const { code } = useParams()
  const { profile } = useAuth()
  const { fetchReviewerByCode, recordResult } = useReviewers()

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

  useEffect(() => {
    loadReviewer()
  }, [code])

  async function loadReviewer() {
    setLoading(true)
    const data = await fetchReviewerByCode(code)
    if (!data) {
      setNotFound(true)
    } else {
      setReviewer(data)
      setStudentName(profile?.full_name ?? '')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <p className="text-sm text-ink-500">Loading assessment...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl border border-slate-200 p-8 text-center">
          <h1 className="text-lg font-bold text-ink-950 mb-2">Invalid Code</h1>
          <p className="text-sm text-ink-500 mb-4">
            No assessment found for code: <strong className="font-mono">{code}</strong>
          </p>
          <BackLink to="/student">Try a different code</BackLink>
        </div>
      </div>
    );
  }

  function handleStart() {
    setQuizQuestions(shuffleArray(reviewer.questions))
    setHasStarted(true)
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-app">
        <TopBar roleLabel="Student" />
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white rounded-xl border border-slate-200 p-8">
            <span className="text-xs font-mono bg-brand-50 text-brand-900 px-2 py-1 rounded">
              {reviewer.code}
            </span>
            <h1 className="text-lg font-bold text-ink-950 mt-3 mb-1">{reviewer.title}</h1>
            <p className="text-sm text-ink-500 mb-4">
              {reviewer.questions.length} questions · Passing score {reviewer.passing_threshold ?? 70}%
            </p>

            {reviewer.instructions && (
              <div className="bg-brand-50 border border-blue-100 rounded-lg px-4 py-3 mb-4">
                <p className="text-xs font-semibold text-brand-900 uppercase tracking-wide mb-1">
                  Instructions
                </p>
                <p className="text-sm text-ink-950 whitespace-pre-line leading-relaxed">
                  {reviewer.instructions}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-ink-500 mb-4 pb-4 border-b border-slate-100">
              <span>Starting as</span>
              <span className="font-medium text-ink-950">{studentName}</span>
            </div>

            <Button onClick={handleStart} className="w-full">
              Start Assessment
            </Button>
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
    if (isCorrect) {
      setScore(score + 1)
    }

    setAnswers((prev) => [
      ...prev,
      { category: question.category ?? 'Uncategorized', correct: isCorrect }
    ])
  }

  async function handleNext() {
    if (isLastQuestion) {
      const finalPercentage = Math.round((score / quizQuestions.length) * 100)
      const finalPassed = finalPercentage >= (reviewer.passing_threshold ?? 70)
      setEncouragement(pickMessage(finalPercentage, finalPassed))

      try {
        await recordResult({
          reviewerId: reviewer.id,
          studentName: studentName.trim(),
          score,
          totalQuestions: quizQuestions.length
        })
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
      if (!categoryStats[category]) {
        categoryStats[category] = { correct: 0, total: 0 }
      }
      categoryStats[category].total += 1
      if (correct) categoryStats[category].correct += 1
    })

    const categoryEntries = Object.entries(categoryStats)
      .filter(([cat]) => cat !== 'Uncategorized')
      .map(([category, stats]) => ({
        category,
        pct: Math.round((stats.correct / stats.total) * 100),
        ...stats
      }))
      .sort((a, b) => a.pct - b.pct)

    const hasCategories = categoryEntries.length > 0

    return (
      <div className="min-h-screen bg-app">
        <TopBar roleLabel="Student" />
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
            <div className="relative w-28 h-28 mx-auto mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke={passed ? '#16a34a' : '#dc2626'}
                  strokeWidth="10"
                  strokeDasharray={`${(percentage / 100) * 264} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-ink-950">{percentage}%</span>
              </div>
            </div>

            <p className="text-sm text-ink-500 mb-1">{reviewer.title}</p>
            <p className="text-ink-950 mb-3">
              {studentName}, you scored{' '}
              <span className="font-bold">{score}/{quizQuestions.length}</span>
            </p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
                passed ? 'bg-status-pass-bg text-status-pass' : 'bg-status-fail-bg text-status-fail'
              }`}
            >
              {passed ? '✅ Passed' : '❌ Not Passed'}
            </span>

            {encouragement && (
              <p className="text-sm text-ink-950 bg-brand-50 border border-blue-100 rounded-lg px-4 py-3 mb-2 leading-relaxed">
                {encouragement}
              </p>
            )}

            {hasCategories && (
              <div className="text-left mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="w-full flex items-center justify-between text-sm"
                >
                  <span className="text-xs font-semibold text-ink-500 uppercase tracking-wide">
                    Breakdown by Category
                  </span>
                  <svg
                    className={`w-4 h-4 text-ink-500 transition-transform ${showBreakdown ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showBreakdown && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {categoryEntries.map(({ category, correct, total, pct }) => {
                      const isStrong = pct >= 70
                      const isWeak = pct < 50
                      return (
                        <div
                          key={category}
                          className={`rounded-lg border px-3 py-2 ${
                            isWeak
                              ? 'bg-status-fail-bg border-red-200'
                              : isStrong
                              ? 'bg-status-pass-bg border-green-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <p className="text-xs font-medium text-ink-950 truncate mb-0.5">
                            {category}
                          </p>
                          <p
                            className={`text-xs font-semibold ${
                              isWeak
                                ? 'text-status-fail'
                                : isStrong
                                ? 'text-status-pass'
                                : 'text-ink-500'
                            }`}
                          >
                            {correct}/{total} · {pct}%
                          </p>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {saveError && (
              <p className="mt-4 text-sm text-status-fail bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">
                {saveError}
              </p>
            )}

            <div className="mt-6 flex justify-center">
              <BackLink to="/student">Back to Student Portal</BackLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app">
      <TopBar roleLabel="Student" />

      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-sm font-semibold text-ink-950">{reviewer.title}</h1>
          <span className="text-xs font-mono text-ink-500">
            {currentIndex + 1} / {quizQuestions.length}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-1.5 mb-6">
          <div
            className="bg-brand-700 h-1.5 rounded-full transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6">
          {question.category && (
            <span className="inline-block text-xs font-medium bg-brand-50 text-brand-900 px-2 py-1 rounded mb-3">
              {question.category}
            </span>
          )}

          <h2 className="text-lg font-semibold text-ink-950 mb-4">{question.question}</h2>

          <div className="flex flex-col gap-2 mb-4">
            {question.choices.map((choice) => {
              const isSelected = selectedAnswer === choice
              const isCorrectChoice = choice === question.correct_answer

              let styles = "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              if (selectedAnswer) {
                if (isCorrectChoice) {
                  styles = "border-status-pass bg-status-pass-bg"
                } else if (isSelected) {
                  styles = "border-status-fail bg-status-fail-bg"
                } else {
                  styles = "border-slate-100 opacity-50"
                }
              }

              return (
                <button
                  key={choice}
                  onClick={() => handleSelect(choice)}
                  disabled={!!selectedAnswer}
                  className={`text-left border rounded-lg px-4 py-2.5 transition-colors ${styles}`}
                >
                  {choice}
                </button>
              )
            })}
          </div>

          {selectedAnswer && (
            <div className="border-t border-slate-100 pt-4">
              {selectedAnswer === question.correct_answer ? (
                <p className="font-medium text-status-pass mb-1">✅ Correct!</p>
              ) : (
                <p className="font-medium text-status-fail mb-1">
                  ❌ Incorrect. Correct answer: {question.correct_answer}
                </p>
              )}
              <p className="text-sm text-ink-500 italic mb-4">{question.rationale}</p>
              <Button onClick={handleNext}>
                {isLastQuestion ? 'See Results' : 'Next Question'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Assessment;