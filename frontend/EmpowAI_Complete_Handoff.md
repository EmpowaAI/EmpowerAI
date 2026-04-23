# 🚀 EmpowAI — Complete Build Handoff (v3, full site)

Hand this entire document to another AI / developer. It contains **everything**
needed to rebuild the EmpowAI marketing site exactly as it stands today:
project setup, folder structure, design tokens, every animation, every page,
every component, plus the dedicated `/demo` interactive demo.

> Stack: **Vite + React 18 + TypeScript + Tailwind CSS v3 + shadcn/ui + react-router-dom + lucide-react**.
> Path alias `@/*` → `src/*` (already wired in `vite.config.ts` & `tsconfig.json`).

---

## 0. Quick install (from a fresh Vite + React + TS project)

```bash
npm create vite@latest empowai -- --template react-ts
cd empowai

# Core deps
npm install react-router-dom @tanstack/react-query lucide-react \
  class-variance-authority clsx tailwind-merge \
  @radix-ui/react-slot @radix-ui/react-tooltip @radix-ui/react-toast \
  sonner

# Tailwind + animation plugin
npm install -D tailwindcss postcss autoprefixer tailwindcss-animate
npx tailwindcss init -p
```

Add the **shadcn/ui** primitives `button.tsx`, `card.tsx`, `tooltip.tsx`,
`toast.tsx`, `toaster.tsx`, `sonner.tsx`, `use-toast.ts` either via the shadcn
CLI (`npx shadcn@latest add button card tooltip toast sonner`) or copy the
source from this project. The full `button.tsx` source (with our custom
`cta` and `outlineLight` variants) is included below — **use ours, not the
default**, otherwise the gradient buttons won't render.

---

## 1. Folder structure (final)

```
<project-root>/
├── index.html                          ← fonts + meta tags
├── package.json
├── tailwind.config.ts                  ← design tokens + animations
├── postcss.config.js
├── vite.config.ts                      ← @/* → src/* alias
├── tsconfig.json
├── public/
│   ├── empowerLogo.jpg                 ← logo (served from URL "/empowerLogo.jpg")
│   ├── favicon.ico
│   └── robots.txt
├── src/
│   ├── main.tsx                        ← Vite entry
│   ├── index.css                       ← ALL design tokens + animation utilities
│   ├── App.tsx                         ← Routes + providers
│   ├── App.css                         ← (can stay empty / default)
│   ├── vite-env.d.ts
│   ├── lib/
│   │   └── utils.ts                    ← cn() helper
│   ├── assets/
│   │   ├── siyanda.jpg                 ← portrait for featured story
│   │   └── hero-bg.png                 ← hero background image
│   ├── hooks/
│   │   ├── use-theme.tsx               ← light/dark provider
│   │   ├── use-reveal.tsx              ← scroll-reveal IntersectionObserver
│   │   ├── use-mobile.tsx              ← shadcn helper
│   │   └── use-toast.ts                ← shadcn helper
│   ├── components/
│   │   ├── ThemeToggle.tsx             ← sun/moon button
│   │   ├── NavLink.tsx                 ← optional react-router NavLink wrapper
│   │   ├── DemoSection.tsx             ← 4-step interactive demo
│   │   └── ui/                         ← shadcn primitives (button, card, etc.)
│   └── pages/
│       ├── Index.tsx                   ← landing page (hero → footer)
│       ├── Demo.tsx                    ← /demo route
│       └── NotFound.tsx                ← 404
```

### Required public assets

| File | Where it's referenced | Notes |
|---|---|---|
| `public/empowerLogo.jpg` | `Index.tsx`, `Demo.tsx`, OG tags | 36×36 displayed, source can be larger |
| `src/assets/siyanda.jpg` | `Index.tsx` (featured story) | Portrait, 64×64 displayed |
| `src/assets/hero-bg.png` | `Index.tsx` (hero) | Full-bleed background, ≥1920×1080 |

---

## 2. Required dependencies (final list)

```json
{
  "dependencies": {
    "@radix-ui/react-slot": "*",
    "@radix-ui/react-tooltip": "*",
    "@radix-ui/react-toast": "*",
    "@tanstack/react-query": "*",
    "class-variance-authority": "*",
    "clsx": "*",
    "lucide-react": "*",
    "react": "^18",
    "react-dom": "^18",
    "react-router-dom": "*",
    "sonner": "*",
    "tailwind-merge": "*"
  },
  "devDependencies": {
    "autoprefixer": "*",
    "postcss": "*",
    "tailwindcss": "^3",
    "tailwindcss-animate": "*",
    "typescript": "^5",
    "vite": "^5",
    "@vitejs/plugin-react-swc": "*"
  }
}
```

---

## 3. Design system (read before coding)

### 3.1 Color tokens (HSL, in `src/index.css`)

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--background` | warm cream `40 33% 98%` | midnight navy `222 47% 7%` | page bg |
| `--foreground` | deep navy `220 55% 18%` | warm cream `40 33% 96%` | body text |
| `--card` | white `0 0% 100%` | navy-11 `222 42% 11%` | card surfaces |
| `--primary` | Ubuntu navy `218 64% 28%` | warm cream `38 60% 92%` | headlines, primary buttons |
| `--primary-glow` | brighter navy `218 70% 42%` | orange glow `22 95% 62%` | gradient stops |
| `--secondary` | warm orange `22 95% 55%` | brighter orange `22 95% 60%` | accent dots, eyebrows |
| `--accent-orange` | hot orange `18 92% 58%` | hot orange `18 92% 62%` | gradient stops |
| `--muted` | warm beige `38 28% 94%` | navy-15 `222 35% 15%` | quiet surfaces, body |
| `--accent` | beige `38 50% 92%` | navy-16 `222 35% 16%` | hover bg |
| `--border` | beige `30 20% 88%` | navy-20 `222 30% 20%` | dividers |
| `--ring` | navy / orange | orange | focus ring |
| `--radius` | `0.625rem` | same | base border radius |

### 3.2 Gradients & shadows (CSS variables)

- `--gradient-hero` — navy → orange diagonal (hero band)
- `--gradient-cta` → utility `bg-cta-gradient` — orange vertical (all CTAs)
- `--gradient-cta-dark` → `bg-cta-gradient-dark` — orange→navy
- `--gradient-ai` → `bg-ai-gradient` — navy→orange diagonal (icon tiles)
- `--shadow-card` → `shadow-card-soft`
- `--shadow-cta` → `shadow-cta`
- `--shadow-glow` → `shadow-glow`
- `--shadow-soft`
- `--transition-smooth` → `transition-smooth`

### 3.3 Typography (loaded in `index.html`)

- **Display** (headings): `'Plus Jakarta Sans'`, weights 600/700/800 → `font-display`
- **Body** (default): `Inter`, weights 400/500/600/700 → `font-sans`
- Fallbacks chained in `tailwind.config.ts`.

### 3.4 Custom Tailwind animations (defined in `tailwind.config.ts`)

| Class | What it does |
|---|---|
| `animate-fade-up` | translateY(12px) + opacity 0 → in, 0.6s ease-out |
| `animate-fade-in` | opacity 0 → 1, 0.5s |
| `animate-scale-in` | scale 0.94 → 1, 0.4s cubic |
| `animate-slide-in-right` | translateX(24px) → 0, 0.5s |
| `animate-float-y` | gentle up/down loop, 5s |
| `animate-glow-pulse` | secondary-color halo pulse, 2.4s loop |
| `animate-gradient-shift` | background-position pan, 8s loop |
| `animate-accordion-down/up` | shadcn accordion |

### 3.5 Custom utility classes (defined in `src/index.css` → `@layer utilities`)

| Class | Purpose |
|---|---|
| `bg-hero-gradient` / `bg-cta-gradient` / `bg-cta-gradient-dark` / `bg-ai-gradient` | gradient backgrounds |
| `shadow-card-soft` / `shadow-cta` / `shadow-glow` | preset shadows |
| `transition-smooth` | preset cubic transition |
| `ai-grid` | masked dotted grid (hero backdrop) |
| `ai-mesh` | two animated blurred gradient blobs (`::before` + `::after`) |
| `ai-spotlight` | rotating conic glow behind hero headline |
| `grain` | SVG noise overlay (premium texture) |
| `shimmer` | sweeping highlight on CTAs |
| `ai-dot` | pulsing 8px secondary dot |
| `text-gradient-ai` | white → soft orange text gradient |
| `text-gradient-animated` | primary → secondary → primary, 6s loop |
| `ubuntu-pattern` | shweshwe-style diamond pattern |
| `hover-lift` | translateY -4px + glow on hover |
| `stagger-children` | auto-staggers direct children with `fade-up` |
| `link-underline` | underline-grow on hover |
| `card-glow` | gradient border that fades in on hover |

### 3.6 Mobile-first rules used everywhere

| Concern | Mobile (<640px) | `sm:` 640+ | `md:` 768+ |
|---|---|---|---|
| Section padding | `py-14` / `py-16` | `py-20` | `py-24` |
| Card padding | `p-5` / `p-6` | `p-7` | `p-8` |
| H1 | `text-3xl/4xl` | `text-4xl` | `text-5xl/6xl/7xl` |
| Buttons | `w-full`, stacked `flex-col` | `w-auto`, `flex-row` | same |
| Action stacks | `flex-col-reverse` (primary thumb-near) | `sm:flex-row` | same |
| Touch target | min 44px (use `size="lg"` h-11) | same | same |

---

## 4. Routing

`src/App.tsx` registers two routes plus a 404 catch-all, wrapped in
`QueryClientProvider`, `ThemeProvider`, `TooltipProvider`, plus the two
toaster providers.

```
/        → <Index />   (landing page)
/demo    → <Demo />    (interactive demo page)
*        → <NotFound />
```

---

## 5. The `/demo` page (what we built last)

Same spec as before. Highlights:

- **Steps**: 0 Upload → 1 Analyse (animated 2.4s cubic ease-out progress) → 2 Explore (5 paths, selectable) → 3 Match summary
- **Local state only**, no backend
- **Reveal-on-scroll** via `useReveal()`
- **Mobile**: step labels hidden, CTAs full-width, action buttons reversed
- **All colors via tokens** (no raw hex)

---

## 6. Validation checklist (entire site)

- [ ] `npm run dev` boots, `/` renders the landing page
- [ ] `/demo` route renders independently
- [ ] "Demo" nav link from `/` → `/demo`
- [ ] Logo on `/demo` → returns to `/`
- [ ] Theme toggle persists in `localStorage` (`empowai-theme`)
- [ ] Dark mode renders correctly on every section
- [ ] All 4 demo steps work end-to-end (auto-advance from step 1)
- [ ] Mobile (<640px): nav collapses, CTAs full-width, demo step labels hidden
- [ ] `prefers-reduced-motion` respected — animations shorten, reveals resolve immediately
- [ ] No raw hex colors in any component (only semantic tokens)
- [ ] Refresh `/demo` does not 404 (SPA fallback)

---

## 7. Full source — every file, in order

Below are the **exact, current contents** of every file you need. Copy each
into the path shown in the heading. The path comments in code (`// src/...`)
are decorative — what matters is the **filename in the heading**.


### `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EmpowAI — Your Future, Powered by AI</title>
    <meta name="description" content="AI-powered career guidance for South African youth. Discover personalised career pathways rooted in Ubuntu values in 60 seconds." />
    <meta name="author" content="EmpowAI" />
    <link rel="canonical" href="https://empowa-ai.co.za/" />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />

    <meta property="og:title" content="EmpowAI — Your Future, Powered by AI" />
    <meta property="og:description" content="AI-powered career pathways rooted in Ubuntu values." />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="/empowerLogo.jpg" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="/empowerLogo.jpg" />
  </head>

  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>

```

### `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          orange: "hsl(var(--accent-orange))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "Inter", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.94)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "float-y": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--secondary) / 0.45)" },
          "50%": { boxShadow: "0 0 0 14px hsl(var(--secondary) / 0)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s ease-out both",
        "fade-in": "fade-in 0.5s ease-out both",
        "scale-in": "scale-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) both",
        "slide-in-right": "slide-in-right 0.5s ease-out both",
        "float-y": "float-y 5s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2.4s ease-out infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

```

### `src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* EmpowAI design system — Ubuntu-inspired warm tones */
@layer base {
  :root {
    --background: 40 33% 98%;
    --foreground: 220 55% 18%;

    --card: 0 0% 100%;
    --card-foreground: 220 55% 18%;

    --popover: 0 0% 100%;
    --popover-foreground: 220 55% 18%;

    /* Deep Ubuntu navy blue */
    --primary: 218 64% 28%;
    --primary-foreground: 40 33% 98%;
    --primary-glow: 218 70% 42%;

    /* Warm orange accent */
    --secondary: 22 95% 55%;
    --secondary-foreground: 0 0% 100%;
    --accent-orange: 18 92% 58%;

    --muted: 38 28% 94%;
    --muted-foreground: 220 20% 42%;

    --accent: 38 50% 92%;
    --accent-foreground: 220 55% 18%;

    --destructive: 0 84% 60%;
    --destructive-foreground: 0 0% 100%;

    --border: 30 20% 88%;
    --input: 30 20% 88%;
    --ring: 218 64% 28%;

    --radius: 0.625rem;

    /* Gradients */
    --gradient-hero: linear-gradient(110deg, hsl(218 64% 32%) 0%, hsl(218 60% 45%) 45%, hsl(22 88% 60%) 100%);
    --gradient-cta: linear-gradient(180deg, hsl(22 95% 60%) 0%, hsl(18 92% 50%) 100%);
    --gradient-cta-dark: linear-gradient(180deg, hsl(22 95% 58%) 0%, hsl(218 64% 28%) 130%);

    /* Shadows */
    --shadow-card: 0 4px 20px -8px hsl(218 64% 28% / 0.15);
    --shadow-cta: 0 8px 24px -8px hsl(22 95% 50% / 0.45);
    --shadow-soft: 0 2px 12px -4px hsl(220 30% 30% / 0.08);

    --transition-smooth: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    /* Restrained accent gradient — navy → orange only */
    --gradient-ai: linear-gradient(135deg, hsl(218 64% 28%) 0%, hsl(22 95% 55%) 100%);
    --shadow-glow: 0 10px 30px -12px hsl(22 95% 50% / 0.35);

    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 240 5.3% 26.1%;
    --sidebar-primary: 240 5.9% 10%;
    --sidebar-primary-foreground: 0 0% 98%;
    --sidebar-accent: 240 4.8% 95.9%;
    --sidebar-accent-foreground: 240 5.9% 10%;
    --sidebar-border: 220 13% 91%;
    --sidebar-ring: 217.2 91.2% 59.8%;
  }

  .dark {
    /* Deep midnight navy base */
    --background: 222 47% 7%;
    --foreground: 40 33% 96%;

    --card: 222 42% 11%;
    --card-foreground: 40 33% 96%;

    --popover: 222 42% 11%;
    --popover-foreground: 40 33% 96%;

    /* Primary inverts to warm cream so navy buttons read on dark bg */
    --primary: 38 60% 92%;
    --primary-foreground: 222 47% 10%;
    --primary-glow: 22 95% 62%;

    /* Orange stays as the warm accent */
    --secondary: 22 95% 60%;
    --secondary-foreground: 222 47% 10%;
    --accent-orange: 18 92% 62%;

    --muted: 222 35% 15%;
    --muted-foreground: 40 20% 75%;

    --accent: 222 35% 16%;
    --accent-foreground: 40 33% 96%;

    --destructive: 0 70% 55%;
    --destructive-foreground: 0 0% 100%;

    --border: 222 30% 20%;
    --input: 222 30% 20%;
    --ring: 22 95% 60%;

    /* Re-tuned gradients for dark surfaces */
    --gradient-hero: linear-gradient(110deg, hsl(222 60% 10%) 0%, hsl(218 55% 22%) 45%, hsl(22 88% 50%) 100%);
    --gradient-cta: linear-gradient(180deg, hsl(22 95% 60%) 0%, hsl(18 92% 48%) 100%);
    --gradient-ai: linear-gradient(135deg, hsl(218 70% 35%) 0%, hsl(22 95% 58%) 100%);

    --shadow-card: 0 4px 24px -8px hsl(0 0% 0% / 0.55);
    --shadow-cta: 0 8px 28px -8px hsl(22 95% 50% / 0.55);
    --shadow-soft: 0 2px 14px -4px hsl(0 0% 0% / 0.5);
    --shadow-glow: 0 12px 36px -10px hsl(22 95% 55% / 0.55);

    --sidebar-background: 222 42% 9%;
    --sidebar-foreground: 40 30% 90%;
    --sidebar-primary: 22 95% 60%;
    --sidebar-primary-foreground: 222 47% 10%;
    --sidebar-accent: 222 35% 16%;
    --sidebar-accent-foreground: 40 33% 96%;
    --sidebar-border: 222 30% 20%;
    --sidebar-ring: 22 95% 60%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  html {
    scroll-behavior: smooth;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "ss01", "cv11";
    transition: background-color 0.4s ease, color 0.4s ease;
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
}

@layer utilities {
  .bg-hero-gradient {
    background-image: var(--gradient-hero);
  }
  .bg-cta-gradient {
    background-image: var(--gradient-cta);
  }
  .bg-cta-gradient-dark {
    background-image: var(--gradient-cta-dark);
  }
  .shadow-card-soft {
    box-shadow: var(--shadow-card);
  }
  .shadow-cta {
    box-shadow: var(--shadow-cta);
  }
  .transition-smooth {
    transition: var(--transition-smooth);
  }
  .bg-ai-gradient {
    background-image: var(--gradient-ai);
  }
  .shadow-glow {
    box-shadow: var(--shadow-glow);
  }
  /* AI grid backdrop */
  .ai-grid {
    background-image:
      linear-gradient(hsl(0 0% 100% / 0.08) 1px, transparent 1px),
      linear-gradient(90deg, hsl(0 0% 100% / 0.08) 1px, transparent 1px);
    background-size: 44px 44px;
    mask-image: radial-gradient(ellipse at center, black 40%, transparent 75%);
  }
  /* Animated mesh blobs */
  .ai-mesh::before,
  .ai-mesh::after {
    content: "";
    position: absolute;
    inset: auto;
    width: 620px;
    height: 620px;
    border-radius: 9999px;
    filter: blur(110px);
    opacity: 0.6;
    pointer-events: none;
    animation: floatBlob 18s ease-in-out infinite;
    will-change: transform;
  }
  .ai-mesh::before {
    background: radial-gradient(circle, hsl(218 64% 32% / 0.45), transparent 65%);
    top: -120px;
    left: -120px;
  }
  .ai-mesh::after {
    background: radial-gradient(circle, hsl(22 95% 55% / 0.45), transparent 65%);
    bottom: -160px;
    right: -120px;
    animation-delay: -7s;
  }
  @keyframes floatBlob {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33%      { transform: translate(60px, -40px) scale(1.1); }
    66%      { transform: translate(-30px, 30px) scale(0.95); }
  }

  /* Spotlight conic glow behind hero headline */
  .ai-spotlight::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 900px;
    height: 900px;
    transform: translate(-50%, -50%);
    background: conic-gradient(from 180deg at 50% 50%,
      hsl(22 95% 55% / 0) 0deg,
      hsl(22 95% 55% / 0.18) 90deg,
      hsl(218 70% 45% / 0.22) 180deg,
      hsl(22 95% 55% / 0.18) 270deg,
      hsl(22 95% 55% / 0) 360deg);
    filter: blur(60px);
    animation: spotlightSpin 22s linear infinite;
    pointer-events: none;
    opacity: 0.7;
  }
  @keyframes spotlightSpin {
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }

  /* Noise grain — adds premium texture */
  .grain::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.06;
    mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>");
  }
  /* Shimmer sweep for CTA */
  .shimmer {
    position: relative;
    overflow: hidden;
  }
  .shimmer::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(110deg, transparent 30%, hsl(0 0% 100% / 0.35) 50%, transparent 70%);
    transform: translateX(-120%);
    animation: shimmerSweep 3.2s ease-in-out infinite;
  }
  @keyframes shimmerSweep {
    to { transform: translateX(120%); }
  }
  /* Pulsing dot — orange accent */
  .ai-dot {
    position: relative;
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    background: hsl(var(--secondary));
    box-shadow: 0 0 0 0 hsl(var(--secondary) / 0.7);
    animation: aiPulse 1.8s ease-out infinite;
  }
  @keyframes aiPulse {
    0% { box-shadow: 0 0 0 0 hsl(var(--secondary) / 0.7); }
    70% { box-shadow: 0 0 0 12px hsl(var(--secondary) / 0); }
    100% { box-shadow: 0 0 0 0 hsl(var(--secondary) / 0); }
  }
  /* Subtle gradient text — white → soft orange */
  .text-gradient-ai {
    background: linear-gradient(90deg, #fff 0%, hsl(22 95% 78%) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  /* Decorative Ubuntu / shweshwe-inspired diamond pattern */
  .ubuntu-pattern {
    background-image:
      linear-gradient(45deg, hsl(0 0% 100% / 0.07) 25%, transparent 25%),
      linear-gradient(-45deg, hsl(0 0% 100% / 0.07) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, hsl(0 0% 100% / 0.07) 75%),
      linear-gradient(-45deg, transparent 75%, hsl(0 0% 100% / 0.07) 75%);
    background-size: 22px 22px;
    background-position: 0 0, 0 11px, 11px -11px, -11px 0;
  }

  /* Dark mode tweaks for atmospheric layers */
  .dark .ai-grid {
    background-image:
      linear-gradient(hsl(22 95% 60% / 0.06) 1px, transparent 1px),
      linear-gradient(90deg, hsl(22 95% 60% / 0.06) 1px, transparent 1px);
  }
  .dark .ai-mesh::before {
    background: radial-gradient(circle, hsl(218 70% 40% / 0.55), transparent 65%);
    opacity: 0.7;
  }
  .dark .ai-mesh::after {
    background: radial-gradient(circle, hsl(22 95% 55% / 0.55), transparent 65%);
    opacity: 0.7;
  }

  /* ===== Enhanced animation utilities ===== */
  .hover-lift {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-glow);
  }

  .stagger-children > * {
    opacity: 0;
    animation: fade-up 0.6s ease-out forwards;
  }
  .stagger-children > *:nth-child(1) { animation-delay: 0.05s; }
  .stagger-children > *:nth-child(2) { animation-delay: 0.15s; }
  .stagger-children > *:nth-child(3) { animation-delay: 0.25s; }
  .stagger-children > *:nth-child(4) { animation-delay: 0.35s; }
  .stagger-children > *:nth-child(5) { animation-delay: 0.45s; }
  .stagger-children > *:nth-child(6) { animation-delay: 0.55s; }

  .text-gradient-animated {
    background: linear-gradient(
      90deg,
      hsl(var(--primary)) 0%,
      hsl(var(--secondary)) 50%,
      hsl(var(--primary)) 100%
    );
    background-size: 200% auto;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    animation: gradient-shift 6s ease infinite;
  }

  .link-underline {
    position: relative;
    display: inline-block;
  }
  .link-underline::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -2px;
    width: 100%;
    height: 2px;
    background: hsl(var(--secondary));
    transform: scaleX(0);
    transform-origin: right;
    transition: transform 0.3s ease;
  }
  .link-underline:hover::after {
    transform: scaleX(1);
    transform-origin: left;
  }

  .card-glow {
    position: relative;
    transition: transform 0.3s ease;
  }
  .card-glow::before {
    content: "";
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: var(--gradient-ai);
    -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
            mask-composite: exclude;
    opacity: 0;
    transition: opacity 0.4s ease;
    pointer-events: none;
  }
  .card-glow:hover::before { opacity: 1; }
  .card-glow:hover { transform: translateY(-3px); }
}

```

### `src/main.tsx`

```tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

```

### `src/App.tsx`

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/hooks/use-theme";
import Index from "./pages/Index.tsx";
import Demo from "./pages/Demo.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/demo" element={<Demo />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

```

### `src/lib/utils.ts`

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

```

### `src/hooks/use-theme.tsx`

```tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "empowai-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    root.style.colorScheme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setThemeState((t) => (t === "light" ? "dark" : "light"));
  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

```

### `src/hooks/use-reveal.tsx`

```tsx
import { useEffect, useRef, useState } from "react";

/**
 * useReveal — IntersectionObserver hook that adds a "revealed" state once
 * the element enters the viewport. Respects prefers-reduced-motion by
 * resolving immediately so content is never hidden.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
) {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setRevealed(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRevealed(true);
        io.disconnect();
      }
    }, options);
    io.observe(node);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, revealed };
}

```

### `src/hooks/use-mobile.tsx`

```tsx
import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

```

### `src/components/ThemeToggle.tsx`

```tsx
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-pressed={isDark}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/60 text-foreground backdrop-blur-md transition-smooth hover:scale-110 hover:border-secondary hover:text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <Sun
        className={cn(
          "absolute h-4 w-4 transition-all duration-500",
          isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100",
        )}
      />
      <Moon
        className={cn(
          "absolute h-4 w-4 transition-all duration-500",
          isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0",
        )}
      />
    </button>
  );
}

```

### `src/components/NavLink.tsx`

```tsx
import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, ...props }, ref) => {
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(className, isActive && activeClassName, isPending && pendingClassName)
        }
        {...props}
      />
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };

```

### `src/components/ui/button.tsx`

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        cta: "bg-cta-gradient text-white shadow-cta hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition-smooth font-semibold",
        outlineLight: "border-2 border-white/90 bg-white/0 text-white hover:bg-white/10 backdrop-blur-sm font-semibold transition-smooth",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

```

### `src/components/DemoSection.tsx`

```tsx
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Cpu,
  FileText,
  Hammer,
  Loader2,
  Palette,
  Play,
  RotateCcw,
  Sparkles,
  Store,
  TrendingUp,
} from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";

type Step = 0 | 1 | 2 | 3;

const PATHS = [
  { icon: Cpu, name: "Tech Skills", match: 95, income: "R4,500 – R18,000", time: "6 wks", tone: "from-primary to-primary-glow" },
  { icon: Hammer, name: "Skilled Trades", match: 82, income: "R3,800 – R14,000", time: "8 wks", tone: "from-secondary to-accent-orange" },
  { icon: Store, name: "SMME / Spaza", match: 74, income: "R2,500 – R22,000", time: "12 wks", tone: "from-primary to-secondary" },
  { icon: Briefcase, name: "Government", match: 68, income: "R5,200 – R11,000", time: "14 wks", tone: "from-primary-glow to-primary" },
  { icon: Palette, name: "Creative Industries", match: 61, income: "R2,000 – R16,000", time: "10 wks", tone: "from-accent-orange to-secondary" },
] as const;

export const DemoSection = () => {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  const [step, setStep] = useState<Step>(0);
  const [progress, setProgress] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);

  // Animate the analyser progress on step 1
  useEffect(() => {
    if (step !== 1) return;
    setProgress(0);
    const start = performance.now();
    const duration = 2400;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        // auto-advance to results
        setTimeout(() => setStep(2), 400);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step]);

  const reset = () => {
    setStep(0);
    setProgress(0);
    setChosen(null);
  };

  const stepLabels = useMemo(
    () => ["Upload", "Analyse", "Explore", "Match"],
    []
  );

  return (
    <section
      id="demo"
      ref={ref}
      className="relative overflow-hidden bg-background py-16 sm:py-20 md:py-24"
    >
      {/* Ambient backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute left-1/2 top-0 h-72 w-[120%] -translate-x-1/2 rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="container">
        {/* Header */}
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ${
            revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
            <Sparkles className="h-3 w-3" />
            Live Demo
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl">
            See EmpowAI in action
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            A 60-second taste of what happens after you upload your CV. No sign-up. Mahala.
          </p>
        </div>

        {/* Step indicator */}
        <div
          className={`mx-auto mt-8 flex max-w-md items-center justify-between gap-2 transition-all duration-700 delay-100 ${
            revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
          aria-label="Demo progress"
        >
          {stepLabels.map((label, i) => {
            const active = i <= step;
            const current = i === step;
            return (
              <div key={label} className="flex flex-1 items-center gap-2">
                <div className="flex flex-col items-center gap-1.5">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-500 ${
                      active
                        ? "bg-primary text-primary-foreground scale-100"
                        : "bg-muted text-muted-foreground scale-90"
                    } ${current ? "ring-4 ring-secondary/30 animate-glow-pulse" : ""}`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`hidden text-[10px] font-semibold uppercase tracking-wider sm:inline ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="absolute inset-y-0 left-0 bg-secondary transition-all duration-700 ease-out"
                      style={{ width: i < step ? "100%" : "0%" }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Stage card — single column on mobile, framed on desktop */}
        <div
          className={`mx-auto mt-8 max-w-3xl transition-all duration-700 delay-200 ${
            revealed ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <Card className="relative overflow-hidden border-border/70 bg-card p-5 shadow-card-soft sm:p-7 md:p-8">
            {/* decorative top border */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/60 to-transparent" />

            {/* === STEP 0: Upload === */}
            {step === 0 && (
              <div className="animate-fade-up">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="absolute inset-0 animate-glow-pulse rounded-2xl" aria-hidden />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-ai-gradient text-primary-foreground shadow-glow">
                      <FileText className="h-9 w-9" strokeWidth={1.8} />
                    </div>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-primary sm:text-xl">
                    Drop your CV — or use ours
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    For this demo we'll use Siyanda's CV. Tap below and watch the AI go to work.
                  </p>

                  <div className="mt-6 flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Button
                      variant="cta"
                      size="lg"
                      className="shimmer w-full sm:w-auto"
                      onClick={() => setStep(1)}
                    >
                      <Play className="mr-1 h-4 w-4" />
                      Run the demo
                    </Button>
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Upload my own CV
                    </Button>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-secondary" />
                      No sign-up
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-secondary" />
                      POPIA compliant
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-secondary" />
                      Free forever — Mahala
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* === STEP 1: Analyse === */}
            {step === 1 && (
              <div className="animate-fade-up">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Loader2 className="h-7 w-7 animate-spin" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-primary sm:text-xl">
                    Analysing CV…
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Neural matching engine · 11,400+ skills graph
                  </p>

                  <div className="mt-6 w-full max-w-md">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span>Progress</span>
                      <span className="font-display text-primary">{progress}%</span>
                    </div>
                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-cta-gradient transition-[width] duration-150 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <ul className="mt-5 space-y-2 text-left text-sm">
                      {[
                        { at: 15, label: "Parsing CV structure" },
                        { at: 40, label: "Extracting skills & experience" },
                        { at: 70, label: "Matching to 5 career pathways" },
                        { at: 95, label: "Calculating Empowerment Score" },
                      ].map((row) => {
                        const done = progress >= row.at;
                        return (
                          <li
                            key={row.label}
                            className={`flex items-center gap-2 transition-colors ${
                              done ? "text-primary" : "text-muted-foreground/70"
                            }`}
                          >
                            {done ? (
                              <CheckCircle2 className="h-4 w-4 text-secondary" />
                            ) : (
                              <span className="h-4 w-4 rounded-full border border-border" />
                            )}
                            <span className="font-medium">{row.label}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* === STEP 2: Explore paths === */}
            {step === 2 && (
              <div className="animate-fade-up">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">
                      Step 3 of 4
                    </span>
                    <h3 className="mt-1 font-display text-lg font-bold text-primary sm:text-xl">
                      Your 5 best-fit paths
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Empowerment Score
                    </div>
                    <div className="font-display text-2xl font-bold text-primary">
                      78<span className="text-sm text-muted-foreground">/100</span>
                    </div>
                  </div>
                </div>

                <ul className="mt-5 space-y-2.5">
                  {PATHS.map((p, i) => {
                    const Icon = p.icon;
                    const isChosen = chosen === i;
                    return (
                      <li
                        key={p.name}
                        style={{ animationDelay: `${i * 70}ms` }}
                        className="animate-fade-up"
                      >
                        <button
                          type="button"
                          onClick={() => setChosen(i)}
                          className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-300 sm:p-4 ${
                            isChosen
                              ? "border-secondary bg-secondary/5 shadow-glow"
                              : "border-border/70 bg-background hover:-translate-y-0.5 hover:border-secondary/50 hover:shadow-card-soft"
                          }`}
                        >
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${p.tone} text-primary-foreground transition-transform duration-300 group-hover:scale-110 sm:h-11 sm:w-11`}
                          >
                            <Icon className="h-5 w-5" strokeWidth={2.2} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate font-display text-sm font-bold text-primary sm:text-base">
                                {p.name}
                              </span>
                              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                                {p.match}% match
                              </span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-cta-gradient transition-[width] duration-700 ease-out"
                                style={{ width: `${p.match}%` }}
                              />
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <TrendingUp className="h-3 w-3 text-secondary" />
                                {p.income}/mo
                              </span>
                              <span>· {p.time} to first gig</span>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <Button variant="ghost" size="sm" onClick={reset}>
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    Restart
                  </Button>
                  <Button
                    variant="cta"
                    size="lg"
                    disabled={chosen === null}
                    onClick={() => setStep(3)}
                    className="shimmer w-full sm:w-auto"
                  >
                    {chosen === null ? "Pick a path to continue" : "Lock it in"}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* === STEP 3: Match summary === */}
            {step === 3 && chosen !== null && (
              <div className="animate-fade-up">
                <div className="flex flex-col items-center text-center">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-ai-gradient text-primary-foreground shadow-glow">
                    <CheckCircle2 className="h-10 w-10" strokeWidth={1.8} />
                  </div>
                  <span className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">
                    Siyaqala! · Let's begin
                  </span>
                  <h3 className="mt-1 font-display text-xl font-bold text-primary sm:text-2xl">
                    {PATHS[chosen].name} — your path
                  </h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                    {PATHS[chosen].match}% match · projected{" "}
                    <span className="font-semibold text-primary">{PATHS[chosen].income}/month</span>{" "}
                    within {PATHS[chosen].time}.
                  </p>

                  <div className="mt-5 grid w-full max-w-md grid-cols-3 gap-2 sm:gap-3">
                    {[
                      { v: "12", l: "Free modules" },
                      { v: "3", l: "Mentors matched" },
                      { v: "47", l: "Local gigs" },
                    ].map((s) => (
                      <div
                        key={s.l}
                        className="rounded-lg border border-border/60 bg-background p-3 text-center"
                      >
                        <div className="font-display text-lg font-bold text-primary sm:text-xl">
                          {s.v}
                        </div>
                        <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground sm:text-[11px]">
                          {s.l}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex w-full flex-col-reverse items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Button variant="ghost" size="lg" onClick={reset} className="w-full sm:w-auto">
                      <RotateCcw className="mr-1 h-4 w-4" />
                      Run again
                    </Button>
                    <Button variant="cta" size="lg" className="shimmer w-full sm:w-auto">
                      Start my real journey
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* helper microcopy */}
          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Demo data based on Siyanda's actual journey · numbers anonymised
          </p>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;

```

### `src/pages/Index.tsx`

```tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Rocket,
  HeartHandshake,
  Briefcase,
  Star,
  Play,
  ArrowRight,
  Upload,
  Gauge,
  Compass,
  CheckCircle2,
  Facebook,
  Twitter,
  Mail,
  Instagram,
  Linkedin,
  Sparkles,
  Cpu,
  Zap,
  MapPin,
  Quote,
  TrendingUp,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Link } from "react-router-dom";
import logo from "/empowerLogo.jpg";
import siyanda from "@/assets/siyanda.jpg";
import heroBg from "@/assets/hero-bg.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="EmpowAI logo"
              className="h-9 w-9 rounded-md object-cover"
              width={36}
              height={36}
            />
            <span className="font-display text-xl font-bold tracking-tight text-primary">
              EmpowAI
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {[
              { label: "How It Works", href: "#how-it-works" },
              { label: "Features", href: "#features" },
              { label: "Ubuntu Stories", href: "#ubuntu-stories" },
              { label: "Demo", href: "/demo", route: true },
            ].map((l) =>
              l.route ? (
                <Link
                  key={l.label}
                  to={l.href}
                  className="text-sm font-medium text-muted-foreground transition-smooth hover:text-primary"
                >
                  {l.label}
                </Link>
              ) : (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-sm font-medium text-muted-foreground transition-smooth hover:text-primary"
                >
                  {l.label}
                </a>
              )
            )}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              Sign In
            </Button>
            <Button variant="cta" size="sm" className="shimmer">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* ===== Hero ===== */}
        <section className="ai-mesh ai-spotlight grain relative overflow-hidden text-white">
          <img
            src={heroBg}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-105 object-cover"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,hsl(220_60%_6%/0.7),hsl(220_60%_8%/0.35)_30%,hsl(220_60%_8%/0.4)_65%,hsl(220_60%_5%/0.75))]"
            aria-hidden
          />
          <div className="ai-grid absolute inset-0 opacity-50" aria-hidden />

          <div className="container relative py-20 md:py-32">
            <div className="mx-auto max-w-3xl text-center animate-fade-up">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/95 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-secondary" />
                Amandla e-Ubuntu
                <span className="text-base leading-none">🇿🇦</span>
              </div>

              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] drop-shadow-sm md:text-6xl lg:text-7xl">
                Your Future,{" "}
                <span className="text-gradient-ai">Powered by AI</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base text-white/90 md:text-lg">
                Discover career pathways rooted in Ubuntu values. Join thousands
                of young South Africans building better futures.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button variant="cta" size="xl" className="shimmer w-full sm:w-auto">
                  Start Your Journey
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button variant="outlineLight" size="xl" className="w-full sm:w-auto">
                  <Play className="mr-1 h-4 w-4" />
                  Watch Demo
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-white/80">
                <span className="inline-flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5 text-secondary" />
                  Neural matching engine
                </span>
                <span className="inline-flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-secondary" />
                  60-second analysis
                </span>
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-secondary" />
                  All 9 provinces · Mzansi
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Trust strip ===== */}
        <section className="border-b border-border bg-background">
          <div className="container grid grid-cols-1 gap-6 py-7 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            {[
              { icon: Rocket, title: "AI-powered career", sub: "guidance in 60 seconds" },
              { icon: HeartHandshake, title: "Rooted in", sub: "Ubuntu values" },
              { icon: Briefcase, title: "Personalized pathways", sub: "to income growth" },
              { icon: Star, title: "Trusted by 2,000+ youth", sub: "Rated 4.9/5" },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="flex items-start gap-3 transition-smooth hover:translate-x-1">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary transition-smooth hover:scale-110 hover:bg-secondary hover:text-secondary-foreground">
                  <Icon className="h-4 w-4" strokeWidth={2.4} />
                </span>
                <div className="text-sm leading-snug">
                  <div className="font-semibold text-primary">{title}</div>
                  <div className="text-muted-foreground">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Featured story (mirrors live site layout) ===== */}
        <section id="ubuntu-stories" className="bg-muted/50 py-20">
          <div className="container">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                Featured Story
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-primary md:text-5xl">
                Siyanda's Journey: from R0 to R4,500/month
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                He didn't get lucky — he explored, compared, and chose. Here's
                exactly how it went.
              </p>
            </div>

            <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-2">
              {/* LEFT — Profile + transformation card */}
              <Card className="relative overflow-hidden border-border/70 bg-card p-6 shadow-card-soft md:p-7">
                {/* Mahala badge */}
                <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  <Zap className="h-3 w-3" />
                  CV Analyser · Mahala
                </div>

                {/* Profile header */}
                <div className="flex items-start gap-4">
                  <img
                    src={siyanda}
                    alt="Portrait of Siyanda Nkosi"
                    width={64}
                    height={64}
                    loading="lazy"
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-secondary/30"
                  />
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold text-primary">
                      Siyanda Nkosi, 22
                    </h3>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> Boksburg, Gauteng
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Empowerment Score
                    </div>
                    <div className="font-display text-2xl font-bold text-primary">
                      78<span className="text-sm text-muted-foreground">/100</span>
                    </div>
                  </div>
                </div>

                {/* Income transformation */}
                <div className="mt-6 rounded-xl border border-border/70 bg-background p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <TrendingUp className="h-3.5 w-3.5 text-secondary" />
                    Income Transformation
                  </div>
                  <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">
                    <div>
                      <div className="text-xs text-muted-foreground">Before</div>
                      <div className="mt-1 font-display text-2xl font-bold text-muted-foreground line-through">
                        R0
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-secondary" />
                    <div>
                      <div className="text-xs text-muted-foreground">After</div>
                      <div className="mt-1 font-display text-2xl font-bold text-secondary">
                        R4,500<span className="text-xs text-muted-foreground">/mo</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stat tiles */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { v: "5", l: "Paths Explored" },
                    { v: "6 wks", l: "To First Gig" },
                    { v: "95%", l: "Match Rate" },
                  ].map((s) => (
                    <div
                      key={s.l}
                      className="rounded-lg bg-accent/50 p-3 text-center"
                    >
                      <div className="font-display text-xl font-bold text-primary">
                        {s.v}
                      </div>
                      <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer rows */}
                <div className="mt-5 space-y-2 border-t border-border/70 pt-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Top Path</span>
                    <span className="font-semibold text-primary">Tech Skills</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Chosen after exploring 5 careers</span>
                    <span className="inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-secondary" />
                      CV analysed in 60s
                    </span>
                  </div>
                </div>
              </Card>

              {/* RIGHT — 5-step journey */}
              <div className="flex flex-col">
                <Card className="border-border/70 bg-card p-6 shadow-card-soft md:p-7">
                  <h3 className="font-display text-xl font-bold text-primary">
                    The 5-step journey
                  </h3>
                  <ol className="mt-5 space-y-4">
                    {[
                      { t: "Uploaded CV", d: "Analyzed in 60 seconds" },
                      { t: "Explored 5 Paths", d: "Tech, Trades, SMME, Gov, Creative" },
                      { t: "Chose Tech Skills", d: "95% match — best fit" },
                      { t: "Hired in 6 weeks", d: "Junior dev, remote-friendly" },
                      { t: "R4,500/month", d: "Up from R0 — and growing" },
                    ].map((step, i) => (
                      <li key={step.t} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xs font-bold text-primary-foreground">
                            {i + 1}
                          </span>
                          {i < 4 && (
                            <span className="mt-1 h-full w-px flex-1 bg-border" />
                          )}
                        </div>
                        <div className="pb-2">
                          <div className="font-semibold text-primary">{step.t}</div>
                          <div className="text-sm text-muted-foreground">{step.d}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Card>

                {/* Quote */}
                <div className="mt-5 rounded-xl border-l-4 border-secondary bg-card p-5 shadow-card-soft">
                  <Quote className="h-5 w-5 text-secondary" />
                  <p className="mt-2 font-display italic text-primary">
                    "I thought I had to choose blind. EmpowAI laid out 5 paths
                    — I picked the one that fit{" "}
                    <span className="not-italic font-bold">me</span>."
                  </p>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Indlela <span className="text-secondary">·</span> isiZulu — The Path
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== How it works ===== */}
        <section id="how-it-works" className="py-20">
          <div className="container">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                Izinsiza Zethu — Our Tools
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-primary md:text-4xl">
                How It Works
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                Three simple steps to discover your career potential.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                { n: "01", icon: Upload, title: "Upload Your CV", desc: "Drop your CV — or build one with us in minutes." },
                { n: "02", icon: Gauge, title: "Get Your Score", desc: "AI reveals your Empowerment Score and gaps." },
                { n: "03", icon: Compass, title: "Explore Career Paths", desc: "Compare 5+ paths with real income projections." },
              ].map(({ n, icon: Icon, title, desc }) => (
                <Card
                  key={title}
                  className="card-glow group relative overflow-hidden border-border/70 bg-card p-7 text-center shadow-card-soft"
                >
                  <span className="pointer-events-none absolute right-4 top-3 font-display text-5xl font-extrabold text-primary/5 transition-transform duration-500 group-hover:scale-125 group-hover:text-secondary/10">
                    {n}
                  </span>
                  <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all duration-500 group-hover:rotate-6 group-hover:bg-secondary group-hover:shadow-cta">
                    <Icon className="h-7 w-7 transition-transform duration-500 group-hover:scale-110" strokeWidth={2.2} />
                  </div>
                  <h3 className="relative mt-5 font-display text-base font-bold text-primary">{title}</h3>
                  <p className="relative mt-2 text-sm text-muted-foreground">{desc}</p>
                </Card>
              ))}
            </div>

            <div className="mt-12 flex justify-center">
              <Button variant="cta" size="xl" className="shimmer">
                Start Your Journey
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* ===== Mzansi testimonials ===== */}
        <section className="bg-muted/40 py-20">
          <div className="container">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                Izindaba Zempumelelo — Ubuntu Stories
              </span>
              <h2 className="mt-3 font-display text-3xl font-bold text-primary md:text-4xl">
                Real Success Stories from Mzansi
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
                See how EmpowAI is transforming careers across all 9 provinces.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                { initials: "LM", name: "Lerato Mokoena", loc: "Cape Town, WC", quote: "From Khayelitsha to a junior dev role. EmpowAI showed me tech skills I didn't know I had. Siyabonga!", earn: "R12,000/mo", path: "Student → Software Developer" },
                { initials: "SK", name: "Sipho Khumalo", loc: "Durban, KZN", quote: "The simulation showed me entrepreneurship was my path. Now I run my own spaza shop AND a marketing agency!", earn: "R18,500/mo", path: "Unemployed → Business Owner" },
                { initials: "NT", name: "Nomsa Tshabalala", loc: "Johannesburg, GP", quote: "From minimum wage to a career I love. The AI actually understood my reality as a young South African.", earn: "R15,000/mo", path: "Waitress → Marketing Pro" },
              ].map((t) => (
                <Card key={t.name} className="card-glow border-border/70 bg-card p-6 shadow-card-soft">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground transition-transform duration-300 hover:scale-110 hover:rotate-6">
                      {t.initials}
                    </span>
                    <div>
                      <div className="font-bold text-primary">{t.name}</div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {t.loc}
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm italic text-muted-foreground">"{t.quote}"</p>
                  <div className="mt-4 rounded-md bg-accent/50 p-3 text-sm">
                    <div className="text-xs text-muted-foreground">💰 Current Earnings</div>
                    <div className="font-bold text-primary">{t.earn}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{t.path}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Siyaqala band ===== */}
        <section className="relative overflow-hidden border-t border-border bg-primary py-14 text-center text-primary-foreground">
          <div className="ai-mesh absolute inset-0" aria-hidden />
          <div className="container relative">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
              Siyaqala! — Let's Begin
            </span>
            <p className="mt-3 font-display text-2xl italic md:text-3xl">
              Join over <span className="text-gradient-ai font-bold not-italic">2,000+</span> young South Africans
              building better careers with AI. Together, we rise. 🇿🇦
            </p>
            <div className="mt-6 flex justify-center">
              <Button variant="cta" size="xl" className="shimmer">
                Start Your Journey
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t border-border bg-background">
        <div className="container flex flex-col items-center justify-between gap-6 py-7 md:flex-row">
          <nav className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-sm">
            {["Features", "Ubuntu Stories", "Demo", "Sign In", "Get Started"].map((label) => (
              <a
                key={label}
                href="#"
                className="font-semibold text-primary underline-offset-4 hover:text-secondary hover:underline"
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {[Facebook, Twitter, Mail, Instagram, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social link"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-smooth hover:bg-secondary"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EmpowAI · Amandla e-Ubuntu 🇿🇦 · Built in Mzansi
        </div>
      </footer>
    </div>
  );
};

export default Index;

```

### `src/pages/Demo.tsx`

```tsx
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DemoSection } from "@/components/DemoSection";
import logo from "/empowerLogo.jpg";

const Demo = () => {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src={logo}
              alt="EmpowAI logo"
              className="h-9 w-9 rounded-md object-cover"
              width={36}
              height={36}
            />
            <span className="font-display text-xl font-bold tracking-tight text-primary">
              EmpowAI
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to site
              </Link>
            </Button>
            <Button variant="cta" size="sm" className="shimmer">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Page intro */}
        <section className="border-b border-border/60 bg-muted/40 py-8 sm:py-10">
          <div className="container">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-smooth hover:text-secondary sm:hidden"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
            <span className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary sm:mt-0">
              Interactive demo
            </span>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-primary sm:text-3xl md:text-4xl">
              Try EmpowAI in 60 seconds
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
              No sign-up. No download. Just tap through Siyanda's real journey and see how the AI matches paths to people.
            </p>
          </div>
        </section>

        {/* The interactive demo */}
        <DemoSection />
      </main>

      {/* ===== Footer ===== */}
      <footer className="border-t border-border bg-background">
        <div className="container py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EmpowAI · Amandla e-Ubuntu 🇿🇦
        </div>
      </footer>
    </div>
  );
};

export default Demo;

```

### `src/pages/NotFound.tsx`

```tsx
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;

```


---

## 8. Where the assets come from

The two image assets in `src/assets/` (`siyanda.jpg`, `hero-bg.png`) and
`public/empowerLogo.jpg` are **binary files** that cannot be embedded in this
markdown. Recreate them however you want:

- **`empowerLogo.jpg`** — square logo, ~512×512, EmpowAI brand mark
- **`siyanda.jpg`** — friendly portrait of a young South African man, square crop, ~512×512
- **`hero-bg.png`** — wide cinematic background suggesting AI / opportunity / South Africa, 1920×1080+

Drop them at the paths shown in section 1 and the imports in `Index.tsx` will resolve.

---

## 9. Deployment notes

- Deploy on any static host with **SPA fallback** so `/demo` doesn't 404 on refresh
  (Lovable / Netlify / Vercel handle this automatically).
- Add a real `<meta name="description">`, OG image, and canonical URL in `index.html`
  before going live (already populated with placeholders in this project).
- Consider lazy-loading `hero-bg.png` (large) and using a `srcset` for retina.

---

**That is the entire site.** Every file, every token, every animation.
Hand this single document to another AI and it will be able to reproduce
EmpowAI 1:1.
