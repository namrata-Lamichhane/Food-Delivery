import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import './Toast.css'

const ToastContext = createContext(null)

// eslint-disable-next-line react/only-export-components -- Context hook and provider belong together
export const useToast = () => useContext(ToastContext)

const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null)
  const timeoutRef = useRef(null)

  const showToast = useCallback((message, type = 'success') => {
    window.clearTimeout(timeoutRef.current)
    setToast({ message, type, id: Date.now() })
    timeoutRef.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  useEffect(
    () => () => window.clearTimeout(timeoutRef.current),
    []
  )

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div
          key={toast.id}
          className={`app-toast app-toast-${toast.type}`}
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
        >
          <span>{toast.message}</span>
          <button
            type='button'
            aria-label='Dismiss notification'
            onClick={() => {
              window.clearTimeout(timeoutRef.current)
              setToast(null)
            }}
          >
            ×
          </button>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export default ToastProvider
