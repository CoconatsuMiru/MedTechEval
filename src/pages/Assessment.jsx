import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useReviewers } from '../context/ReviewerContext'
import { useAuth } from '../context/AuthContext'
import { shuffleArray } from '../utils/shuffle'
import Button from '../components/Button'

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
      // Pre-fill name field from their profile, but let them edit it
      setStudentName(profile?.full_name ?? '')
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Loading assessment...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <h1 className="text-xl font-bold text-slate-800 mb-2">Invalid Code</h1>
          <p className="text-slate-600 mb-4">
            No assessment found for code: <strong>{code}</strong>
          </p>
          <Link to="/student" className="text-blue-600 hover:underline text-sm">
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h1 className="text-xl font-bold text-slate-800 mb-1">{reviewer.title}</h1>
          <p className="text-slate-600 mb-4">Confirm your name to begin:</p>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Your name"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button onClick={handleStart} className="w-full">
            Start Assessment
          </Button>
        </div>
      </div>
    );
  }

  const question = quizQuestions[currentIndex]
  const isLastQuestion = currentIndex === quizQuestions.length - 1

  function handleSelect(choice) {
    if (selectedAnswer) return
    setSelectedAnswer(choice)
    if (choice === question.correct_answer) {
      setScore(score + 1)
    }
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

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <h1 className="text-xl font-bold text-slate-800 mb-1">Results</h1>
          <p className="text-slate-500 mb-4">{reviewer.title}</p>
          <p className="text-lg text-slate-800 mb-2">
            {studentName}, you scored{' '}
            <span className="font-bold text-blue-600">
              {score}/{quizQuestions.length}
            </span>{' '}
            ({percentage}%)
          </p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-4 ${
              passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {passed ? '✅ Passed' : '❌ Not Passed'}
          </span>
          {saveError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
              {saveError}
            </p>
          )}
          <br />
          <Link to="/student" className="text-blue-600 hover:underline text-sm">
            ← Back to Student Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-xl w-full bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-slate-800">{reviewer.title}</h1>
          <span className="text-sm text-slate-500">
            Question {currentIndex + 1} of {quizQuestions.length}
          </span>
        </div>

        <h2 className="text-xl font-semibold text-slate-800 mb-4">{question.question}</h2>

        <div className="flex flex-col gap-2 mb-4">
          {question.choices.map((choice) => {
            const isSelected = selectedAnswer === choice
            const isCorrectChoice = choice === question.correct_answer

            let styles = "border-slate-300 hover:bg-slate-50"
            if (selectedAnswer) {
              if (isCorrectChoice) {
                styles = "border-green-500 bg-green-50"
              } else if (isSelected) {
                styles = "border-red-500 bg-red-50"
              } else {
                styles = "border-slate-200 opacity-60"
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
              <p className="font-medium text-green-700 mb-1">✅ Correct!</p>
            ) : (
              <p className="font-medium text-red-700 mb-1">
                ❌ Incorrect. Correct answer: {question.correct_answer}
              </p>
            )}
            <p className="text-sm text-slate-600 italic mb-4">{question.rationale}</p>
            <Button onClick={handleNext}>
              {isLastQuestion ? 'See Results' : 'Next Question'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Assessment;