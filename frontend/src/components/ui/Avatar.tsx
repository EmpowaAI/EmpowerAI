import React from "react"
import { cn } from "../../lib/utils"

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'processing'
  className?: string
}

export default function Avatar({ size = 'md', variant = 'default', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }
  
  const variantClasses = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-accent text-accent-foreground',
    processing: 'bg-primary text-primary-foreground animate-pulse'
  }
  
  return (
    <div className={cn(
      "relative inline-flex items-center justify-center rounded-full",
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      <span className="text-sm font-medium">AI</span>
    </div>
  )
}
