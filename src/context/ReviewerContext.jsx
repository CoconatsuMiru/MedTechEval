import { createContext, useContext } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './AuthContext'

const ReviewerContext = createContext()

function generateCode() {
  const random = Math.floor(1000 + Math.random() * 9000)
  return `MED-${random}`
}

export function ReviewerProvider({ children }) {
  const { user } = useAuth()

  // Fetch all reviewers owned by the currently logged-in teacher
  async function fetchTeacherReviewers() {
    const { data, error } = await supabase
      .from('reviewers')
      .select('id, code, title, passing_threshold, questions(id)')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  // Fetch one reviewer by its access code, including its questions
  async function fetchReviewerByCode(code) {
    const { data, error } = await supabase
      .from('reviewers')
      .select('id, code, title, passing_threshold, questions(*)')
      .eq('code', code)
      .single()

    if (error) return null // no matching reviewer (or RLS blocked it)
    return data
  }

  // Create a new reviewer + its questions, owned by the current teacher
  async function createReviewer({ title, passingThreshold, questions }) {
    const code = generateCode()

    const { data: reviewer, error: reviewerError } = await supabase
      .from('reviewers')
      .insert({
        code,
        title,
        passing_threshold: passingThreshold,
        teacher_id: user.id
      })
      .select()
      .single()

    if (reviewerError) throw reviewerError

    const questionRows = questions.map((q) => ({
      reviewer_id: reviewer.id,
      question: q.question,
      choices: q.choices,
      correct_answer: q.correctAnswer,
      rationale: q.rationale,
      category: q.category ?? null
    }))

    const { error: questionsError } = await supabase
      .from('questions')
      .insert(questionRows)

    if (questionsError) throw questionsError

    return code
  }

  // Update a reviewer's title/passing threshold
  async function updateReviewer(reviewerId, updates) {
    const { error } = await supabase
      .from('reviewers')
      .update(updates)
      .eq('id', reviewerId)

    if (error) throw error
  }

  // Delete a reviewer (questions + results cascade automatically via the DB)
  async function deleteReviewer(reviewerId) {
    const { error } = await supabase
      .from('reviewers')
      .delete()
      .eq('id', reviewerId)

    if (error) throw error
  }

  // Record a completed student attempt
  async function recordResult({ reviewerId, studentName, score, totalQuestions }) {
    const { error } = await supabase
      .from('results')
      .insert({
        reviewer_id: reviewerId,
        student_id: user.id,
        student_name: studentName,
        score,
        total_questions: totalQuestions
      })

    if (error) throw error
  }

  // Fetch all results for a given reviewer (used by the Teacher dashboard)
  async function fetchResultsForReviewer(reviewerId) {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('reviewer_id', reviewerId)
      .order('completed_at', { ascending: false })

    if (error) throw error
    return data
  }

  const value = {
    fetchTeacherReviewers,
    fetchReviewerByCode,
    createReviewer,
    updateReviewer,
    deleteReviewer,
    recordResult,
    fetchResultsForReviewer
  }

  return (
    <ReviewerContext.Provider value={value}>
      {children}
    </ReviewerContext.Provider>
  )
}

export function useReviewers() {
  return useContext(ReviewerContext)
}