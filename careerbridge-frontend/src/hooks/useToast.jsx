import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  const toast = useCallback((m) => {
    setMsg(m)
    setVisible(true)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setVisible(false), 3200)
  }, [])

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      {visible && (
        <div id="toast" style={{ animation: 'toastIn 0.35s cubic-bezier(.34,1.3,.64,1)' }}>
          {msg}
        </div>
      )}
    </ToastCtx.Provider>
  )
}

export const useToast = () => useContext(ToastCtx)
