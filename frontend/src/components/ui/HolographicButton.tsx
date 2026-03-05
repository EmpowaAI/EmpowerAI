import type { ReactNode } from "react"
import { cn } from "../../lib/utils"

interface HolographicButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
}

export default function HolographicButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className
}: HolographicButtonProps) {
  const baseClasses = "relative overflow-hidden font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
  
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25",
    secondary: "bg-secondary text-secondary-foreground hover:shadow-lg hover:shadow-secondary/25",
    accent: "bg-accent text-accent-foreground hover:shadow-lg hover:shadow-accent/25"
  }
  
  const sizeClasses = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-2xl"
  }
  
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabledClasses,
        className
      )}
    >
      {/* Subtle overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-1000" />
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && (
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
            <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-75" />
            <div className="w-2 h-2 bg-current rounded-full animate-pulse delay-150" />
          </div>
        )}
        {children}
      </span>
    </button>
  )
}
