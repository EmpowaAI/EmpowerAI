import { Loader2 } from "lucide-react"
import { cn } from "../lib/utils"
import { ButtonHTMLAttributes } from "react"

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean
  loadingText?: string
  icon?: React.ReactNode
}

export default function LoadingButton({
  isLoading = false,
  loadingText = "Loading...",
  icon,
  children,
  className,
  disabled,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={isLoading || disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-all duration-200",
        isLoading && "opacity-75 cursor-not-allowed",
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {icon && icon}
          {children}
        </>
      )}
    </button>
  )
}
