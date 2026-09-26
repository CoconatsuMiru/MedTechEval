import { useState } from 'react'
import { useReviewers } from '../context/ReviewerContext'
import Modal from './Modal'
import Button from './Button'

function CreateBookModal({ onClose, onCreated }) {
  const { createBook } = useReviewers()
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setSaving(true)
    setError('')
    try {
      const book = await createBook({ title: title.trim() })
      onCreated(book)
    } catch (err) {
      setError('Failed to create book. Please try again.')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal onClose={onClose}>
      <h2 className="text-lg font-bold text-ink-950 mb-1">Create Book</h2>
      <p className="text-sm text-ink-500 mb-4">Students access all its chapters with one code.</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Medical Technology Board Reviewer"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-700"
          />
        </div>
        {error && (
          <p className="text-sm text-status-fail bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">{error}</p>
        )}
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create Book'}</Button>
          <button type="button" onClick={onClose} disabled={saving} className="text-sm text-ink-500 hover:underline disabled:opacity-50">Cancel</button>
        </div>
      </form>
    </Modal>
  );
}

export default CreateBookModal;