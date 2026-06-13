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
  
  const dotColors = ['bg-primary', 'bg-secondary', 'bg-primary', 'bg-secondary', 'bg-primary']

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex gap-1">
        {dotColors.map((color, index) => (
          <div
            key={index}
            className={cn(
              "rounded-full animate-pulse",
              color,
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
