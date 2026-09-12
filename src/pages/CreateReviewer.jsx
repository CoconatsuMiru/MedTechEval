import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReviewers } from '../context/ReviewerContext'
import { validateReviewerData } from '../utils/validateReviewer'
import Card from '../components/Card'
import Button from '../components/Button'

function CreateReviewer() {
  const { createReviewer } = useReviewers()
  const [passingThreshold, setPassingThreshold] = useState(70)
  const [errors, setErrors] = useState([])
  const [parsedData, setParsedData] = useState(null)
  const [successCode, setSuccessCode] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')

  function handleFileChange(e) {
    const file = e.target.files[0]
    setErrors([])
    setParsedData(null)
    setSuccessCode(null)
    setPublishError('')

    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      let data
      try {
        data = JSON.parse(event.target.result)
      } catch (err) {
        setErrors(['Could not parse JSON file. Please check the file format.'])
        return
      }

      const validationErrors = validateReviewerData(data)
      if (validationErrors.length > 0) {
        setErrors(validationErrors)
        return
      }

      setParsedData(data)
    }

    reader.readAsText(file)
  }

  async function handlePublish() {
    setPublishing(true)
    setPublishError('')

    try {
      const code = await createReviewer({
        title: parsedData.title,
        passingThreshold: Number(passingThreshold),
        questions: parsedData.questions
      })
      setSuccessCode(code)
      setParsedData(null)
    } catch (err) {
      setPublishError('Failed to publish reviewer. Please try again.')
      console.error(err)
    } finally {
      setPublishing(false)
    }
  }

  function handleCancelPreview() {
    setParsedData(null)
  }

  if (successCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <Card className="max-w-md w-full text-center">
          <h1 className="text-xl font-bold text-slate-800 mb-2">Reviewer Published</h1>
          <p className="text-green-700 font-medium mb-3">✅ Success!</p>
          <p className="text-slate-700 mb-6">
            Access code: <span className="font-mono font-semibold">{successCode}</span>
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/teacher" className="text-blue-600 hover:underline text-sm">
              ← Back to Teacher Portal
            </Link>
            <button
              onClick={() => setSuccessCode(null)}
              className="text-blue-600 hover:underline text-sm"
            >
              Create Another
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (parsedData) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <Card>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Preview Reviewer</h1>
            <p className="text-slate-600 mb-4">
              <strong>{parsedData.title}</strong> — {parsedData.questions.length} questions parsed successfully.
            </p>

            <label className="block text-sm font-medium text-slate-700 mb-1">
              Passing Threshold (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={passingThreshold}
              onChange={(e) => setPassingThreshold(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex flex-col gap-4 max-h-96 overflow-y-auto mb-6 pr-1">
              {parsedData.questions.map((q, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-slate-400 mb-1">
                    ITEM {index + 1}{q.category ? ` • ${q.category}` : ''}
                  </p>
                  <p className="font-medium text-slate-800 mb-2">{q.question}</p>
                  <ul className="flex flex-col gap-1 mb-2">
                    {q.choices.map((choice) => (
                      <li
                        key={choice}
                        className={`text-sm px-2 py-1 rounded ${
                          choice === q.correctAnswer
                            ? 'bg-green-50 text-green-700 font-medium'
                            : 'text-slate-600'
                        }`}
                      >
                        {choice === q.correctAnswer ? '✓ ' : ''}{choice}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-500 italic">{q.rationale}</p>
                </div>
              ))}
            </div>

            {publishError && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {publishError}
              </p>
            )}

            <div className="flex gap-3">
              <Button onClick={handlePublish} disabled={publishing}>
                {publishing ? 'Publishing...' : 'Publish Reviewer'}
              </Button>
              <button
                onClick={handleCancelPreview}
                disabled={publishing}
                className="text-sm text-slate-500 hover:underline disabled:opacity-50"
              >
                Cancel, choose a different file
              </button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Create / Import Reviewer</h1>
        <p className="text-slate-600 mb-6">Upload a .json file containing your questions.</p>

        <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6 cursor-pointer hover:border-blue-400 transition-colors">
          <span className="text-sm text-slate-500 mb-1">Click to select a .json file</span>
          <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
        </label>

        {errors.length > 0 && (
          <div className="mt-4 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <p className="text-red-700 font-medium mb-1">
              Found {errors.length} issue{errors.length > 1 ? 's' : ''}:
            </p>
            <ul className="list-disc list-inside text-red-600">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <Link to="/teacher" className="block mt-6 text-sm text-blue-600 hover:underline">
          ← Back to Teacher Portal
        </Link>
      </Card>
    </div>
  );
}

export default CreateReviewer;