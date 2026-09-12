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
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Teacher Portal</h1>
          <Link
            to="/teacher/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Create New Reviewer
          </Link>
        </div>

        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Your Reviewers
        </h2>

        <div className="flex flex-col gap-4">
          {reviewerList.map((reviewer) => {
            const reviewerResults = getResultsForCode(reviewer.code)
            return (
              <div
                key={reviewer.code}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-slate-800">{reviewer.title}</h3>
                  <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {reviewer.code}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-3">
                  {reviewer.questionCount} questions
                </p>

                <div className="border-t border-slate-100 pt-3">
                  {reviewerResults.length === 0 ? (
                    <p className="text-sm text-slate-400">No attempts yet.</p>
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {reviewerResults.map((result, i) => {
                        const pct = Math.round((result.score / result.totalQuestions) * 100)
                        const threshold = reviewers[reviewer.code].passingThreshold ?? 70
                        const passed = pct >= threshold
                        return (
                          <li key={i} className="text-sm text-slate-600 flex justify-between items-center">
                            <span>{result.studentName}</span>
                            <span className="flex items-center gap-2">
                              <span className="font-medium">
                                {result.score}/{result.totalQuestions} ({pct}%)
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}
                              >
                                {passed ? 'Passed' : 'Failed'}
                              </span>
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <Link to="/" className="inline-block mt-6 text-sm text-blue-600 hover:underline">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default Teacher;