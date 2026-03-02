/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
    },
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#0f172a",
        card: {
          DEFAULT: "#ffffff",
          foreground: "#0f172a",
        },
        primary: {
          DEFAULT: "#3b82f6", // Neural Blue (from VISION_BLUEPRINT)
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#06b6d4", // Cyber Cyan (from VISION_BLUEPRINT)
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#f1f5f9",
          foreground: "#64748b",
        },
        accent: {
          DEFAULT: "#10b981", // AI Green (from VISION_BLUEPRINT)
          foreground: "#ffffff",
        },
        premium: {
          DEFAULT: "#8b5cf6", // Quantum Purple (from VISION_BLUEPRINT)
          foreground: "#ffffff",
        },
        border: "#e2e8f0",
        ring: "#3b82f6",
        success: "#10b981",
        warning: "#f59e0b",
        destructive: "#ef4444",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
}
