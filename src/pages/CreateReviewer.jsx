import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useReviewers } from '../context/ReviewerContext'

function CreateReviewer() {
  const { createReviewer } = useReviewers()
  const [error, setError] = useState('')
  const [successCode, setSuccessCode] = useState(null)

  function handleFileChange(e) {
    const file = e.target.files[0]
    setError('')
    setSuccessCode(null)

    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result)

        if (!data.title || !Array.isArray(data.questions)) {
          setError('JSON must have a "title" and a "questions" array.')
          return
        }

        const code = createReviewer(data)
        setSuccessCode(code)
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        setError('Could not parse JSON file. Please check the file format.')
      }
    }

    reader.readAsText(file)
  }

  return (
    <div>
      <h1>Create / Import Reviewer</h1>
      <p>Upload a .json file containing your questions.</p>

      <input type="file" accept=".json" onChange={handleFileChange} />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {successCode && (
        <div>
          <p>✅ Reviewer created successfully!</p>
          <p>Access code: <strong>{successCode}</strong></p>
        </div>
      )}

      <p><Link to="/teacher">← Back to Teacher Portal</Link></p>
    </div>
  );
}

export default CreateReviewer;