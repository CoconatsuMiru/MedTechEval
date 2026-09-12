export function validateReviewerData(data) {
  const errors = []

  if (!data.title || typeof data.title !== 'string') {
    errors.push('Missing or invalid "title" (must be text).')
  }

  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    errors.push('Missing "questions" array, or it is empty.')
    return errors // no point checking individual questions if there aren't any
  }

  data.questions.forEach((q, index) => {
    const num = index + 1

    if (!q.question || typeof q.question !== 'string') {
      errors.push(`Question ${num}: missing "question" text.`)
    }

    if (!Array.isArray(q.choices) || q.choices.length < 2) {
      errors.push(`Question ${num}: "choices" must be an array of at least 2 options.`)
    }

    if (!q.correctAnswer || typeof q.correctAnswer !== 'string') {
      errors.push(`Question ${num}: missing "correctAnswer".`)
    } else if (Array.isArray(q.choices) && !q.choices.includes(q.correctAnswer)) {
      errors.push(`Question ${num}: "correctAnswer" does not match any of the listed choices.`)
    }

    if (!q.rationale || typeof q.rationale !== 'string') {
      errors.push(`Question ${num}: missing "rationale".`)
    }
  })

  return errors
}