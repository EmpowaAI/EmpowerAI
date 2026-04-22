import React from "react"
import { cn } from "../../lib/utils"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "cta" | "outlineLight"
  size?: "sm" | "md" | "lg" | "xl"
  children: React.ReactNode
}

export default function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
  
  const variantClasses = {
    primary: "bg-primary text-primary-foreground hover:bg-primary-hover shadow-sm",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary-hover",
    accent: "bg-accent text-accent-foreground hover:bg-accent-hover",
    outline: "border border-primary text-primary hover:bg-primary hover:text-primary-foreground",
    ghost: "text-primary hover:bg-primary/10",
    cta: "bg-gradient-to-r from-secondary to-secondary/90 text-white shadow-cta hover:brightness-105 hover:-translate-y-0.5 transition-smooth font-semibold",
    outlineLight: "border-2 border-white/90 bg-white/0 text-white hover:bg-white/10 backdrop-blur-sm font-semibold"
  }
  
  const sizeClasses = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2 text-sm",
    lg: "h-12 px-6 text-base",
    xl: "h-12 rounded-md px-8 text-base"
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
