import { cn } from "../../lib/utils"

interface AIAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'speaking' | 'thinking' | 'processing'
  className?: string
}

export default function AIAvatar({ size = 'md', variant = 'default', className }: AIAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }
  
  const variantClasses = {
    default: 'bg-primary',
    speaking: 'bg-accent animate-pulse',
    thinking: 'bg-secondary animate-pulse',
    processing: 'bg-primary animate-spin'
  }
  
  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Main avatar */}
      <div
        className={cn(
          "w-full h-full rounded-full shadow-lg",
          variantClasses[variant]
        )}
      >
        {/* Inner core */}
        <div className="absolute inset-2 rounded-full bg-card flex items-center justify-center">
          {/* Center light */}
          <div className="h-2 w-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
        </div>
      </div>
      
      {/* Subtle ring */}
      <div className="absolute -inset-1 rounded-full bg-primary/20 blur-sm animate-pulse" />
      
      {/* Voice waves for speaking variant */}
      {variant === 'speaking' && (
        <>
          <div className="absolute -inset-3 rounded-full border-2 border-accent/30 animate-ping" />
          <div className="absolute -inset-4 rounded-full border border-accent/20 animate-ping animation-delay-200" />
        </>
      )}
    </div>
  )
}
