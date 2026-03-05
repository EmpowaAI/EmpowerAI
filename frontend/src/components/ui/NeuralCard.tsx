import type { ReactNode } from "react"
import { cn } from "../../lib/utils"

interface NeuralCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
}

export default function NeuralCard({ children, className, hover = true, glow = false }: NeuralCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-6 shadow-xl",
        "border-border",
        hover && "transition-all duration-300 hover:scale-[1.02] hover:border-border hover:shadow-lg",
        className
      )}
    >
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Subtle top border accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  )
}
