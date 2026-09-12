import { useEffect } from 'react'

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
        className={`bg-white rounded-xl shadow-xl w-full p-6 max-h-[90vh] overflow-y-auto ${maxWidthClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;