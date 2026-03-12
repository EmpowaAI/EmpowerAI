// components/ProgressTracker.tsx
import { CheckCircle, Circle } from "lucide-react"
import { cn } from "../lib/utils"

const steps = [
  { id: "cv", label: "CV Analysis", path: "/dashboard/cv-analyzer" },
  { id: "twin", label: "Build Twin", path: "/dashboard/twin" },
  { id: "dashboard", label: "Dashboard", path: "/dashboard" }
]

interface ProgressTrackerProps {
  currentStep: string
}

export default function ProgressTracker({ currentStep }: ProgressTrackerProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStep)
  
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted -z-10" />
        <div 
          className="absolute top-4 left-0 h-0.5 bg-primary -z-10 transition-all duration-500"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />
        
        {steps.map((step, index) => {
          const status = index < currentIndex ? "completed" : 
                        index === currentIndex ? "current" : "pending"
          
          return (
            <div key={step.id} className="flex flex-col items-center relative">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                status === "completed" && "bg-primary border-primary",
                status === "current" && "bg-primary/10 border-primary",
                status === "pending" && "bg-background border-muted"
              )}>
                {status === "completed" ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : status === "current" ? (
                  <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <span className={cn(
                "mt-2 text-xs font-medium transition-colors",
                status === "completed" && "text-primary",
                status === "current" && "text-foreground",
                status === "pending" && "text-muted-foreground"
              )}>
                {step.label}
              </span>
              <span className="text-xs text-muted-foreground mt-1">
                Step {index + 1}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}