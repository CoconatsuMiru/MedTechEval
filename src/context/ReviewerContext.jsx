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

  async function fetchTeacherReviewers() {
    const { data, error } = await supabase
      .from('reviewers')
      .select('id, code, title, passing_threshold, questions(id)')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async function fetchReviewerByCode(code) {
    const { data, error } = await supabase
      .from('reviewers')
      .select('id, code, title, passing_threshold, questions(*)')
      .eq('code', code)
      .single()

    if (error) return null
    return data
  }

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

  async function updateReviewer(reviewerId, updates) {
    const { error } = await supabase
      .from('reviewers')
      .update(updates)
      .eq('id', reviewerId)

    if (error) throw error
  }

  async function deleteReviewer(reviewerId) {
    const { error } = await supabase
      .from('reviewers')
      .delete()
      .eq('id', reviewerId)

    if (error) throw error
  }

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

  async function fetchResultsForReviewer(reviewerId) {
    const { data, error } = await supabase
      .from('results')
      .select('*')
      .eq('reviewer_id', reviewerId)
      .order('completed_at', { ascending: false })

    if (error) throw error
    return data
  }

  // Fetch all of the current student's past attempts, across every reviewer
  async function fetchStudentResults() {
    const { data, error } = await supabase
      .from('results')
      .select('id, score, total_questions, completed_at, reviewers(title, code, passing_threshold)')
      .eq('student_id', user.id)
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
    fetchResultsForReviewer,
    fetchStudentResults
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