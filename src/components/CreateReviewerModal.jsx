import { useState } from 'react'
import { useReviewers } from '../context/ReviewerContext'
import { validateReviewerData } from '../utils/validateReviewer'
import Modal from './Modal'
import Button from './Button'

function CreateReviewerModal({ onClose, onCreated }) {
  const { createReviewer } = useReviewers()
  const [passingThreshold, setPassingThreshold] = useState(70)
  const [errors, setErrors] = useState([])
  const [parsedData, setParsedData] = useState(null)
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')

  function handleFileChange(e) {
    const file = e.target.files[0]
    setErrors([])
    setParsedData(null)
    setPublishError('')

    if (!file) return

    const reader = new FileReader()

    reader.onload = (event) => {
      let data
      try {
        data = JSON.parse(event.target.result)
      // eslint-disable-next-line no-unused-vars
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
      onCreated(code) // parent shows a success toast/message and refreshes the list
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

  if (parsedData) {
    return (
      <Modal onClose={onClose} maxWidthClass="max-w-2xl">
        <h2 className="text-lg font-bold text-ink-950 mb-1">Preview Reviewer</h2>
        <p className="text-sm text-ink-500 mb-4">
          <strong className="text-ink-950">{parsedData.title}</strong> —{' '}
          {parsedData.questions.length} questions parsed successfully.
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
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-brand-700"
        />

        <div className="flex flex-col gap-4 max-h-80 overflow-y-auto mb-6 pr-1">
          {parsedData.questions.map((q, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-ink-500 mb-1">
                ITEM {index + 1}{q.category ? ` • ${q.category}` : ''}
              </p>
              <p className="font-medium text-ink-950 mb-2">{q.question}</p>
              <ul className="flex flex-col gap-1 mb-2">
                {q.choices.map((choice) => (
                  <li
                    key={choice}
                    className={`text-sm px-2 py-1 rounded ${
                      choice === q.correctAnswer
                        ? 'bg-status-pass-bg text-status-pass font-medium'
                        : 'text-ink-500'
                    }`}
                  >
                    {choice === q.correctAnswer ? '✓ ' : ''}{choice}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-ink-500 italic">{q.rationale}</p>
            </div>
          ))}
        </div>

        {publishError && (
          <p className="mb-4 text-sm text-status-fail bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">
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
            className="text-sm text-ink-500 hover:underline disabled:opacity-50"
          >
            Cancel, choose a different file
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-bold text-ink-950 mb-1">Create / Import Reviewer</h2>
      <p className="text-sm text-ink-500 mb-6">Upload a .json file containing your questions.</p>

      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg p-6 cursor-pointer hover:border-brand-700 transition-colors">
        <span className="text-sm text-ink-500 mb-1">Click to select a .json file</span>
        <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
      </label>

      {errors.length > 0 && (
        <div className="mt-4 text-sm bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">
          <p className="text-status-fail font-medium mb-1">
            Found {errors.length} issue{errors.length > 1 ? 's' : ''}:
          </p>
          <ul className="list-disc list-inside text-status-fail">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onClose}
        className="block mt-6 text-sm text-ink-500 hover:underline"
      >
        Cancel
      </button>
    </Modal>
  );
}

export default CreateReviewerModal;