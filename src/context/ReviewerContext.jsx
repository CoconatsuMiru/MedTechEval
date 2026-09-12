import { createContext, useContext, useState, useEffect } from 'react'
import initialReviewers from '../data/reviewers'

const ReviewerContext = createContext()

function loadFromStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch (err) {
    console.error(`Failed to load ${key} from localStorage`, err)
    return fallback
  }
}

export function ReviewerProvider({ children }) {
  const [reviewers, setReviewers] = useState(() =>
    loadFromStorage('mte_reviewers', initialReviewers)
  )
  const [results, setResults] = useState(() =>
    loadFromStorage('mte_results', [])
  )

  // Whenever reviewers changes, save it to localStorage
  useEffect(() => {
    localStorage.setItem('mte_reviewers', JSON.stringify(reviewers))
  }, [reviewers])

  // Whenever results changes, save it to localStorage
  useEffect(() => {
    localStorage.setItem('mte_results', JSON.stringify(results))
  }, [results])

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
    const random = Math.floor(1000 + Math.random() * 9000)
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