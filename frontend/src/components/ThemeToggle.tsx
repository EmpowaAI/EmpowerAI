import React from 'react'
import { Moon, Sun } from "lucide-react"
import { useTheme } from "../lib/theme"
import { cn } from "../lib/utils"

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "group relative p-2.5 rounded-xl transition-all duration-300 ease-out",
        "bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900",
        "border border-slate-200/80 dark:border-slate-700/80",
        "hover:bg-gradient-to-br hover:from-slate-200 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-800",
        "hover:border-indigo-300 dark:hover:border-indigo-600",
        "hover:shadow-lg hover:shadow-indigo-500/20 dark:hover:shadow-indigo-900/30",
        "active:scale-[0.96]",
        "focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900",
        "backdrop-blur-sm"
      )}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Subtle glow effect */}
      <div className={cn(
        "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        "bg-gradient-to-br from-indigo-400/10 to-cyan-400/10 dark:from-indigo-500/20 dark:to-cyan-500/20",
        "blur-sm"
      )} />
      
      <div className="relative w-5 h-5">
        {/* Sun icon with rotation */}
        <Sun
          className={cn(
            "absolute inset-0 w-5 h-5 transition-all duration-500 ease-in-out",
            "text-amber-500 dark:text-amber-400",
            isDark 
              ? "opacity-0 rotate-90 scale-0" 
              : "opacity-100 rotate-0 scale-100 group-hover:rotate-12"
          )}
        />
        {/* Moon icon with rotation */}
        <Moon
          className={cn(
            "absolute inset-0 w-5 h-5 transition-all duration-500 ease-in-out",
            "text-indigo-600 dark:text-indigo-400",
            isDark 
              ? "opacity-100 rotate-0 scale-100 group-hover:-rotate-12" 
              : "opacity-0 -rotate-90 scale-0"
          )}
        />
      </div>
    </button>
  )
}

