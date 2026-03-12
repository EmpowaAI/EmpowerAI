"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../lib/theme";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-secondary transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-sa-gold" />
      ) : (
        <Moon className="h-5 w-5 text-muted-foreground" />
      )}
    </button>
  );
}