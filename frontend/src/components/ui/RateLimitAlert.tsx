import { AlertCircle, RefreshCw, Clock } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "../../lib/utils"

interface RateLimitAlertProps {
  message?: string
  retryAfter?: number
  onRetry?: () => void
  className?: string
}

export default function RateLimitAlert({ 
  message = "AI service is temporarily rate limited. Please wait a moment and try again.",
  retryAfter = 60,
  onRetry,
  className 
}: RateLimitAlertProps) {
  const [countdown, setCountdown] = useState(retryAfter)
  const [canRetry, setCanRetry] = useState(false)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setCanRetry(true)
    }
  }, [countdown])

  const handleRetry = () => {
    if (canRetry && onRetry) {
      setCountdown(retryAfter)
      setCanRetry(false)
      onRetry()
    }
  }

  return (
    <div className={cn(
      "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4",
      className
    )}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
            Rate Limit Reached
          </h3>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
            {message}
          </p>
          
          {countdown > 0 ? (
            <div className="flex items-center gap-2 text-sm text-yellow-700 dark:text-yellow-300">
              <Clock className="h-4 w-4" />
              <span>Please wait {countdown} second{countdown !== 1 ? 's' : ''} before trying again</span>
            </div>
          ) : (
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
