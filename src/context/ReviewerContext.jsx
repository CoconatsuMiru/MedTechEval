import { createContext, useContext, useState } from 'react'
import initialReviewers from '../data/reviewers'

const ReviewerContext = createContext()

export function ReviewerProvider({ children }) {
  const [reviewers, setReviewers] = useState(initialReviewers)
  const [results, setResults] = useState([])

  function addReviewer(code, reviewerData) {
    setReviewers((prev) => ({
      ...prev,
      [code]: reviewerData
    }))
  }

  function createReviewer(reviewerData) {
    const code = generateCode()
    addReviewer(code, reviewerData)
    return code
  }

  function generateCode() {
    const random = Math.floor(1000 + Math.random() * 9000) // 4-digit number
    return `MED-${random}`
  }

  function recordResult(code, studentName, score, totalQuestions) {
    const newResult = {
      code,
      studentName,
      score,
      totalQuestions,
      completedAt: new Date().toISOString()
    }
    setResults((prev) => [...prev, newResult])
  }

  function getResultsForCode(code) {
    return results.filter((r) => r.code === code)
  }

  const value = {
    reviewers,
    addReviewer,
    createReviewer,
    results,
    recordResult,
    getResultsForCode
  }

  return (
    <ReviewerContext.Provider value={value}>
      {children}
    </ReviewerContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useReviewers() {
  return useContext(ReviewerContext)
}