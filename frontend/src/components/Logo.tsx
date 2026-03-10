// components/Logo.tsx
import { Link } from "react-router-dom"
import { cn } from "../lib/utils"

interface LogoProps {
  variant?: "default" | "light" | "dark"
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
  linkTo?: string
}

export default function Logo({ 
  variant = "default", 
  size = "md", 
  showText = true,
  className,
  linkTo = "/"
}: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8 rounded-lg",
    md: "h-9 w-9 rounded-lg",
    lg: "h-10 w-10 rounded-lg"
  }

  const textSizeClasses = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl"
  }

  const variantClasses = {
    default: "text-foreground",
    light: "text-white",
    dark: "text-foreground"
  }

  const logoElement = (
    <div className={cn("flex items-center gap-2 font-bold group", className)}>
      <div className="bg-gradient-to-br from-sa-gold via-sa-green to-sa-blue flex items-center justify-center shadow-md overflow-hidden">
        <img 
          src="/images/empowerLogo.jpg"
          alt="EmpowaAI Logo" 
          className={cn(
            sizeClasses[size],
            "object-contain transition-transform duration-300 group-hover:scale-105"
          )}
          loading="eager"
          width={size === "sm" ? 32 : size === "md" ? 36 : 40}
          height={size === "sm" ? 32 : size === "md" ? 36 : 40}
        />
      </div>
      {showText && (
        <span className={cn(
          textSizeClasses[size],
          "font-display transition-colors duration-300",
          variantClasses[variant]
        )}>
          Empowa<span className={cn(variant === "light" ? "text-white/90" : "text-sa-gold")}>AI</span>
        </span>
      )}
    </div>
  )

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-block">
        {logoElement}
      </Link>
    )
  }

  return logoElement
}
