import { useEffect } from 'react'
import { X } from 'lucide-react'

function Modal({ onClose, children, maxWidthClass = 'max-w-md' }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4 py-8"
      onClick={onClose}
    >
      <div
        className={`relative bg-white rounded-2xl shadow-xl w-full p-6 max-h-[90vh] overflow-y-auto animate-fade-up ${maxWidthClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-md text-ink-500 hover:bg-slate-100 hover:text-ink-950 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;