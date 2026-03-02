import React from "react"
import { cn } from "../../lib/utils"

interface VoiceVisualizerProps {
  isActive?: boolean
  intensity?: number
  className?: string
}

export default function VoiceVisualizer({ isActive = false, intensity = 0.5, className }: VoiceVisualizerProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {[1, 2, 3, 4, 5].map((_, i) => (
        <div
          key={i}
          className={cn(
            "w-1 bg-primary rounded-full transition-all duration-150",
            isActive ? "animate-pulse" : "opacity-30"
          )}
          style={{
            height: isActive ? `${8 + intensity * 12}px` : "4px",
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
    </div>
  )
}
