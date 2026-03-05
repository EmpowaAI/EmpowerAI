import { cn } from "../../lib/utils"

interface NeuralLoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export default function NeuralLoading({ size = 'md', className, text }: NeuralLoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }
  
  const dots = Array.from({ length: 5 }, (_, i) => i)
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Neural synapse animation */}
      <div className="flex gap-1">
        {dots.map((index) => (
          <div
            key={index}
            className={cn(
              "rounded-full bg-primary animate-pulse",
              sizeClasses[size]
            )}
            style={{
              animationDelay: `${index * 0.2}s`,
            }}
          />
        ))}
      </div>
      
      {/* Optional text */}
      {text && (
        <span className="text-sm text-muted-foreground animate-pulse">
          {text}
        </span>
      )}
    </div>
  )
}
