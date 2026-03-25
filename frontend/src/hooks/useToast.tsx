// frontend/src/hooks/useToast.tsx (rename to .tsx)
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react"
import { cn } from "../lib/utils"

export type ToastType = "success" | "error" | "warning" | "info"

interface ToastItem {
  id: number
  message: string
  type: ToastType
}

// Toast Component
export function ToastContainer({ toasts, removeToast }: { 
  toasts: ToastItem[], 
  removeToast: (id: number) => void 
}) {
  useEffect(() => {
    const timers = toasts.map(toast => 
      setTimeout(() => removeToast(toast.id), 5000)
    )
    return () => timers.forEach(clearTimeout)
  }, [toasts, removeToast])

  const getIcon = (type: ToastType) => {
    switch(type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case 'info': return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getStyles = (type: ToastType) => {
    switch(type) {
      case 'success': return 'border-green-500/20 bg-green-500/10'
      case 'error': return 'border-red-500/20 bg-red-500/10'
      case 'warning': return 'border-amber-500/20 bg-amber-500/10'
      case 'info': return 'border-blue-500/20 bg-blue-500/10'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100 }}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg backdrop-blur-sm",
              getStyles(toast.type)
            )}
          >
            {getIcon(toast.type)}
            <p className="text-sm text-foreground">{toast.message}</p>
            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-4 p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = (message: string, type: ToastType = "info") => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
  }

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  return {
    toasts,
    showToast,
    removeToast,
    success: (message: string) => showToast(message, "success"),
    error: (message: string) => showToast(message, "error"),
    warning: (message: string) => showToast(message, "warning"),
    info: (message: string) => showToast(message, "info"),
    ToastContainer: () => <ToastContainer toasts={toasts} removeToast={removeToast} />
  }
}