// components/Logo.tsx
import React from 'react'
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
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  }

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  }

  const variantClasses = {
    default: "text-foreground",
    light: "text-white",
    dark: "text-slate-900 dark:text-slate-100"
  }

  const logoElement = (
    <div className={cn("flex items-center gap-3 group", className)}>
      <div className="relative">
        <img 
          src="/images/logo.jpeg" 
          alt="EmpowerAI Logo" 
          className={cn(
            sizeClasses[size],
            "rounded-xl object-cover shadow-lg transition-all duration-300",
            "group-hover:shadow-xl group-hover:scale-105",
            "ring-2 ring-transparent group-hover:ring-primary/20",
            variant === "light" 
              ? "shadow-primary/25 group-hover:shadow-primary/40" 
              : "shadow-primary/20 group-hover:shadow-primary/30"
          )}
          loading="eager"
          width={size === "sm" ? 32 : size === "md" ? 40 : 48}
          height={size === "sm" ? 32 : size === "md" ? 40 : 48}
        />
        {/* Subtle glow effect on hover */}
        <div className={cn(
          "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
          "bg-gradient-to-br from-primary/20 to-secondary/20 blur-sm -z-10"
        )} />
      </div>
      {showText && (
        <span className={cn(
          textSizeClasses[size],
          "font-bold transition-all duration-300",
          variant === "default" 
            ? "bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent group-hover:from-primary group-hover:to-secondary"
            : variantClasses[variant],
          "drop-shadow-sm"
        )}>
          EmpowerAI
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
