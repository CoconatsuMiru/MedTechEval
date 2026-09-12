import { useToast } from '../context/ToastContext'

function Toast() {
  const { toast } = useToast()

  if (!toast) return null

  return (
    <div
      key={toast.id} // forces a fresh mount + fresh animation each time a new toast appears
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg animate-toast"
    >
      {toast.message}
    </div>
  );
}

export default Toast;