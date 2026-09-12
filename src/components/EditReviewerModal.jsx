import { useState } from 'react'
import { useReviewers } from '../context/ReviewerContext'
import Modal from './Modal'
import Button from './Button'

function EditReviewerModal({ reviewer, onClose, onSaved }) {
  const { updateReviewer } = useReviewers()
  const [title, setTitle] = useState(reviewer.title)
  const [passingThreshold, setPassingThreshold] = useState(reviewer.passing_threshold)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      await updateReviewer(reviewer.id, {
        title: title.trim(),
        passing_threshold: Number(passingThreshold)
      })
      onSaved() // parent closes the modal + refreshes the list
    } catch (err) {
      setError('Failed to save changes. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-bold text-ink-950 mb-1">Edit Reviewer</h2>
      <p className="text-xs text-ink-500 font-mono mb-4">{reviewer.code}</p>

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Passing Threshold (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={passingThreshold}
            onChange={(e) => setPassingThreshold(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-700"
          />
        </div>

        {error && (
          <p className="text-sm text-status-fail bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-sm text-ink-500 hover:underline disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default EditReviewerModal;