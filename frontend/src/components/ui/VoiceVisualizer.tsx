import { cn } from "../../lib/utils"

interface VoiceVisualizerProps {
  isActive?: boolean
  intensity?: number
  className?: string
}

export default function VoiceVisualizer({ isActive = false, intensity = 0.5, className }: VoiceVisualizerProps) {
  const bars = Array.from({ length: 7 }, (_, i) => i)
  
  return (
    <div className={cn("flex items-center gap-1 h-8", className)}>
      {bars.map((index) => {
        const height = isActive ? Math.random() * 100 * intensity : 20
        const delay = index * 0.1
        
        return (
          <div
            key={index}
            className={cn(
              "w-1 bg-accent rounded-full transition-all duration-150",
              isActive ? "animate-pulse" : "opacity-30"
            )}
            style={{
              height: `${height}%`,
              minHeight: '4px',
              maxHeight: '32px',
              animationDelay: isActive ? `${delay}s` : '0s',
            }}
          />
        )
      })}
    </div>
  )
}
