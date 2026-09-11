import { Link } from 'react-router-dom'
import { useReviewers } from '../context/ReviewerContext'

function Teacher() {
  const { reviewers, getResultsForCode } = useReviewers()
  const reviewerList = Object.entries(reviewers).map(([code, data]) => ({
    code,
    title: data.title,
    questionCount: data.questions.length
  }))

  return (
    <div>
      <h1>Teacher Portal</h1>
      <p><Link to="/teacher/create">+ Create New Reviewer</Link></p>
      <p>Your reviewers:</p>

      <ul>
        {reviewerList.map((reviewer) => {
          const reviewerResults = getResultsForCode(reviewer.code)
          return (
            <li key={reviewer.code}>
              <strong>{reviewer.title}</strong> — Code: {reviewer.code} ({reviewer.questionCount} questions)
              <ul>
                {reviewerResults.length === 0 && <li>No attempts yet.</li>}
                {reviewerResults.map((result, i) => (
                  <li key={i}>
                    {result.studentName}: {result.score}/{result.totalQuestions}
                  </li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>

      <Link to="/">← Back to Home</Link>
    </div>
  );
}

export default Teacher;