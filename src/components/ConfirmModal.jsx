import { useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import Modal from './Modal'

function ConfirmModal({
  title,
  message,
  confirmLabel = 'Delete',
  busyLabel = 'Deleting...',
  onConfirm,
  onCancel
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    setBusy(true)
    setError('')
    try {
      await onConfirm() // parent closes the modal when this succeeds
    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
      setBusy(false)
    }
  }

  return (
    <Modal onClose={() => { if (!busy) onCancel() }}>
      <div className="flex items-start gap-3 pr-6">
        <div className="w-10 h-10 rounded-full bg-status-fail-bg text-status-fail flex items-center justify-center flex-shrink-0">
          <TriangleAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-ink-950 mb-1">{title}</h2>
          <p className="text-sm text-ink-500 leading-relaxed">{message}</p>
        </div>
      </div>

      {error && (
        <p className="mt-4 text-sm text-status-fail bg-status-fail-bg border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onCancel}
          disabled={busy}
          className="text-sm font-medium text-ink-950 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirm}
          disabled={busy}
          className="text-sm font-medium text-white bg-status-fail hover:bg-red-700 px-4 py-2 rounded-lg shadow-sm transition-colors disabled:opacity-50"
        >
          {busy ? busyLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmModal;