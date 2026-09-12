import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useReviewers } from '../context/ReviewerContext'
import { useAuth } from '../context/AuthContext'
import { shuffleArray } from '../utils/shuffle'
import Button from '../components/Button'
import TopBar from '../components/TopBar'

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
          <Link to="/student" className="text-sm text-brand-700 hover:underline">
            ← Try a different code
          </Link>
        </div>
      </div>
    );
  }

  function handleStart() {
    if (!studentName.trim()) return
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
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirm your name to begin
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Your name"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
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
    const hasCategories = categoryEntries.some(([cat]) => cat !== 'Uncategorized')

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
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                passed ? 'bg-status-pass-bg text-status-pass' : 'bg-status-fail-bg text-status-fail'
              }`}
            >
              {passed ? '✅ Passed' : '❌ Not Passed'}
            </span>

            {hasCategories && (
              <div className="text-left mt-6 pt-6 border-t border-slate-100">
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide mb-3">
                  Breakdown by Category
                </p>
                <div className="flex flex-col gap-3">
                  {categoryEntries.map(([category, stats]) => {
                    const catPct = Math.round((stats.correct / stats.total) * 100)
                    return (
                      <div key={category}>
                        <div className="flex justify-between text-sm text-ink-950 mb-1">
                          <span>{category}</span>
                          <span className="font-medium">
                            {stats.correct}/{stats.total} ({catPct}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div
                            className="bg-brand-700 h-1.5 rounded-full"
                            style={{ width: `${catPct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {saveError && (
              <p className="mt-4 text-sm text-status-fail bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">
                {saveError}
              </p>
            )}

            <Link to="/student" className="inline-block mt-6 text-sm text-brand-700 hover:underline">
              ← Back to Student Portal
            </Link>
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