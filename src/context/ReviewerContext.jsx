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

  async function fetchTeacherBooks() {
    const { data, error } = await supabase
      .from('books')
      .select('id, code, title, created_at, reviewers(id)')
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  }

  async function fetchBookByCode(code) {
    const { data, error } = await supabase
      .from('books')
      .select('id, code, title')
      .eq('code', code)
      .single()
    if (error) return null
    return data
  }

  async function createBook({ title }) {
    const code = generateCode()
    const { data, error } = await supabase
      .from('books')
      .insert({ code, title, teacher_id: user.id })
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function deleteBook(bookId) {
    const { error } = await supabase.from('books').delete().eq('id', bookId)
    if (error) throw error
  }

  async function unlockBook(code) {
    const book = await fetchBookByCode(code)
    if (!book) return null
    const { error } = await supabase
      .from('book_access')
      .upsert({ student_id: user.id, book_id: book.id }, { onConflict: 'student_id,book_id' })
    if (error) throw error
    return book
  }

  async function fetchStudentBooks() {
    const { data, error } = await supabase
      .from('book_access')
      .select('unlocked_at, books(id, code, title)')
      .eq('student_id', user.id)
      .order('unlocked_at', { ascending: false })
    if (error) throw error
    return data
  }

  async function fetchChaptersForBook(bookId) {
    const { data, error } = await supabase
      .from('reviewers')
      .select('id, title, passing_threshold, instructions, created_at, questions(id)')
      .eq('book_id', bookId)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  }

  async function fetchReviewerById(reviewerId) {
    const { data, error } = await supabase
      .from('reviewers')
      .select('id, title, passing_threshold, instructions, questions(*), books(title, code)')
      .eq('id', reviewerId)
      .single()
    if (error) return null
    return data
  }

  async function createChapter({ bookId, title, passingThreshold, instructions, questions }) {
    const { data: reviewer, error: reviewerError } = await supabase
      .from('reviewers')
      .insert({
        book_id: bookId,
        title,
        passing_threshold: passingThreshold,
        instructions: instructions?.trim() || null,
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
    const { error: questionsError } = await supabase.from('questions').insert(questionRows)
    if (questionsError) throw questionsError

    return reviewer.id
  }

  async function updateReviewer(reviewerId, updates) {
    const { error } = await supabase.from('reviewers').update(updates).eq('id', reviewerId)
    if (error) throw error
  }

  async function deleteReviewer(reviewerId) {
    const { error } = await supabase.from('reviewers').delete().eq('id', reviewerId)
    if (error) throw error
  }

  async function recordResult({ reviewerId, studentName, score, totalQuestions }) {
    const { error } = await supabase.from('results').insert({
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

  async function fetchStudentResults() {
    const { data, error } = await supabase
      .from('results')
      .select('id, score, total_questions, completed_at, reviewers(title, passing_threshold, books(title, code))')
      .eq('student_id', user.id)
      .order('completed_at', { ascending: false })
    if (error) throw error
    return data
  }

  const value = {
    fetchTeacherBooks, fetchBookByCode, createBook, deleteBook,
    unlockBook, fetchStudentBooks,
    fetchChaptersForBook, fetchReviewerById, createChapter,
    updateReviewer, deleteReviewer,
    recordResult, fetchResultsForReviewer, fetchStudentResults
  }

  return <ReviewerContext.Provider value={value}>{children}</ReviewerContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useReviewers() {
  return useContext(ReviewerContext)
}