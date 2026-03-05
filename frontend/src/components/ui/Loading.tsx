import React from "react"
import { cn } from "../../lib/utils"

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

export default function Loading({ size = 'md', text, className }: LoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }
  
  const dotSizeClasses = {
    sm: 'h-1 w-1',
    md: 'h-1.5 w-1.5',
    lg: 'h-2 w-2'
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex gap-1">
        <div className={cn("rounded-full bg-primary animate-pulse", dotSizeClasses[size])} />
        <div className={cn("rounded-full bg-primary animate-pulse", dotSizeClasses[size])} style={{ animationDelay: '0.2s' }} />
        <div className={cn("rounded-full bg-primary animate-pulse", dotSizeClasses[size])} style={{ animationDelay: '0.4s' }} />
      </div>
      {text && <span className="text-sm text-muted-foreground ml-2">{text}</span>}
    </div>
  )
}
