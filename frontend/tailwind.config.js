/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // This is crucial! It enables dark mode via class
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        highlight: 'hsl(var(--highlight))',
        card: 'hsl(var(--card))',
        'card-foreground': 'hsl(var(--card-foreground))',
        popover: 'hsl(var(--popover))',
        'popover-foreground': 'hsl(var(--popover-foreground))',
        primary:    { DEFAULT: "hsl(var(--primary))",   foreground: "hsl(var(--primary-foreground))",   glow: "hsl(var(--primary-glow))" },
        secondary:  { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: 'hsl(var(--muted))',
        'muted-foreground': 'hsl(var(--muted-foreground))',
        accent:     { DEFAULT: "hsl(var(--accent))",    foreground: "hsl(var(--accent-foreground))", orange: "hsl(var(--accent-orange))" },
        destructive: 'hsl(var(--destructive))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        sidebar: 'hsl(var(--sidebar-background))',
        'sidebar-foreground': 'hsl(var(--sidebar-foreground))',
        'sidebar-primary': 'hsl(var(--sidebar-primary))',
        'sidebar-primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
        'sidebar-accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
        'sidebar-border': 'hsl(var(--sidebar-border))',
        'sidebar-ring': 'hsl(var(--sidebar-ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
      },
      backgroundImage: {
        'ai-gradient': 'var(--gradient-ai)',
        'hero-gradient': 'var(--gradient-hero)',
        'cta-gradient': 'var(--gradient-cta)',
      },
      boxShadow: {
        'glow': '0 10px 30px -12px hsl(22 95% 50% / 0.35)',
        'card': '0 4px 20px -8px hsl(218 64% 28% / 0.15)',
        'cta': '0 8px 24px -8px hsl(22 95% 50% / 0.45)',
        'soft': 'var(--shadow-soft)',
        'elevated': '0 10px 40px -10px hsl(218 64% 28% / 0.2)',
      },
      animation: {
        'float-blob': 'floatBlob 14s ease-in-out infinite',
        'shimmer-sweep': 'shimmerSweep 3.2s ease-in-out infinite',
        'ai-pulse': 'aiPulse 1.8s ease-out infinite',
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fade-in 0.6s ease-out forwards',
        'slide-up': 'slide-up 0.6s ease-out forwards',
      },
      transition: {
        'smooth': 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        floatBlob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(40px, -30px) scale(1.08)' },
        },
        shimmerSweep: {
          '0%': { transform: 'translateX(-120%)' },
          '100%': { transform: 'translateX(120%)' },
        },
        aiPulse: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 hsl(22 95% 55% / 0.7)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 12px hsl(22 95% 55% / 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 hsl(22 95% 55% / 0)' },
        },
      },
    },
  },
  plugins: [],
}
