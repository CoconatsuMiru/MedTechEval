import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReviewers } from '../context/ReviewerContext'
import { validateReviewerData } from '../utils/validateReviewer'
import Card from '../components/Card'

function CreateReviewer() {
  const { createReviewer } = useReviewers()
  const [passingThreshold, setPassingThreshold] = useState(70)
  const [errors, setErrors] = useState([])
  const [successCode, setSuccessCode] = useState(null)

  function handleFileChange(e) {
    const file = e.target.files[0]
    setErrors([])
    setSuccessCode(null)

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

      const reviewerWithThreshold = {
        ...data,
        passingThreshold: Number(passingThreshold)
      }

      const code = createReviewer(reviewerWithThreshold)
      setSuccessCode(code)
    }

    reader.readAsText(file)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="max-w-md w-full">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Create / Import Reviewer</h1>
        <p className="text-slate-600 mb-6">Upload a .json file containing your questions.</p>

        <label className="block text-sm font-medium text-slate-700 mb-1">
          Passing Threshold (%)
        </label>
        <input
          type="number"
          min="0"
          max="100"
          value={passingThreshold}
          onChange={(e) => setPassingThreshold(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

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

        {successCode && (
          <div className="mt-4 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <p className="text-green-700 font-medium mb-1">✅ Reviewer created successfully!</p>
            <p className="text-slate-700">
              Access code: <span className="font-mono font-semibold">{successCode}</span>
            </p>
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