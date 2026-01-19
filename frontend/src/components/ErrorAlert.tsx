import { AlertCircle, X } from "lucide-react"
import { cn } from "../lib/utils"
import { useState } from "react"

interface ErrorAlertProps {
  message: string
  onDismiss?: () => void
  className?: string
  dismissible?: boolean
}

export default function ErrorAlert({ 
  message, 
  onDismiss,
  className,
  dismissible = true
}: ErrorAlertProps) {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  const handleDismiss = () => {
    setIsVisible(false)
    onDismiss?.()
  }

  return (
    <div className={cn(
      "flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl",
      className
    )}>
      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
      <p className="text-sm text-destructive flex-1">{message}</p>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="text-destructive hover:text-destructive/80 transition-colors"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
