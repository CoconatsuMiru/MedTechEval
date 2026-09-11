import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useReviewers } from '../context/ReviewerContext'

function Assessment() {
  const { code } = useParams()
  const { reviewers, recordResult } = useReviewers()
  const reviewer = reviewers[code]

  const [studentName, setStudentName] = useState('')
  const [hasStarted, setHasStarted] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  if (!reviewer) {
    return (
      <div>
        <h1>Invalid Code</h1>
        <p>No assessment found for code: <strong>{code}</strong></p>
        <Link to="/student">← Try a different code</Link>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div>
        <h1>{reviewer.title}</h1>
        <p>Enter your name to begin:</p>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Your name"
        />
        <button
          onClick={() => studentName.trim() && setHasStarted(true)}
        >
          Start Assessment
        </button>
      </div>
    );
  }

  const question = reviewer.questions[currentIndex]
  const isLastQuestion = currentIndex === reviewer.questions.length - 1

  function handleSelect(choice) {
    if (selectedAnswer) return
    setSelectedAnswer(choice)
    if (choice === question.correctAnswer) {
      setScore(score + 1)
    }
  }

  function handleNext() {
    if (isLastQuestion) {
      const finalScore = selectedAnswer === question.correctAnswer ? score : score
      recordResult(code, studentName, finalScore, reviewer.questions.length)
      setShowResults(true)
    } else {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
    }
  }

  if (showResults) {
    return (
      <div>
        <h1>Results</h1>
        <p>{reviewer.title}</p>
        <p>{studentName}, you scored {score} out of {reviewer.questions.length}</p>
        <Link to="/student">← Back to Student Portal</Link>
      </div>
    );
  }

  return (
    <div>
      <h1>{reviewer.title}</h1>
      <p>Question {currentIndex + 1} of {reviewer.questions.length}</p>
      <h2>{question.question}</h2>

      <ul>
        {question.choices.map((choice) => (
          <li key={choice}>
            <button onClick={() => handleSelect(choice)}>
              {choice}
            </button>
          </li>
        ))}
      </ul>

      {selectedAnswer && (
        <div>
          {selectedAnswer === question.correctAnswer ? (
            <p>✅ Correct!</p>
          ) : (
            <p>❌ Incorrect. Correct answer: {question.correctAnswer}</p>
          )}
          <p><em>{question.rationale}</em></p>
          <button onClick={handleNext}>
            {isLastQuestion ? 'See Results' : 'Next Question'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Assessment;