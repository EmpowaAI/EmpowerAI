# CV Analyzer Page — Integration Guide

A complete, framework-agnostic spec for adding the **CV Analyzer** page to an existing React + Vite + Tailwind site. Hand this whole document to another AI and it will be able to reproduce the page faithfully.

---

## 1. What you're building

A single route `/cv-analyzer` with three visual phases driven by local state:

1. **`idle`** — Drag-and-drop upload zone (PDF / DOCX / TXT, max 10MB).
2. **`analyzing`** — Premium progress UI:
   - Large SVG circular ring showing **overall %**.
   - 5 sequential stages, each with its own thin progress bar, pulsing icon, and "ping" ring on the active stage.
   - Stages auto-advance via `requestAnimationFrame` with an ease-in-out curve (1600ms each).
3. **`complete`** — Success state with a CTA to view career matches and a "Analyse another CV" reset.

Aesthetic: minimalist, editorial, lots of whitespace, serif display font for headings, soft ambient background orbs, semantic Tailwind tokens only (no hardcoded colors).

---

## 2. Prerequisites in the host project

The page assumes the host site already has:

| Requirement | Notes |
|---|---|
| **React 18 + Vite + TypeScript** | Standard Lovable stack. |
| **React Router v6** | For `<Link>` and `useNavigate`. |
| **Tailwind CSS v3** | With `darkMode: ["class"]`. |
| **shadcn/ui `Button`** | At `@/components/ui/button` — needs a `variant="cta"` (gradient) or fall back to `default`. |
| **lucide-react** | For all icons. |
| **Semantic HSL tokens** in `index.css` | `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--muted-foreground`, `--card`, `--border`. |
| **Display font** | Tailwind class `font-display` mapped to a serif (e.g. Fraunces). If absent, the page still works — headings just render in the sans default. |
| **Optional components** | `ThemeToggle`, `ProfileMenu`, `ContactWidget` — remove the imports if the host site doesn't have them. |
| **Logo** | A logo image at `/empowerLogo.jpg` in `public/`. Replace with the host site's logo path. |

If `font-display`, `variant="cta"`, or the `animate-fade-up` / `shimmer` utilities don't exist, see **Section 6** for fallbacks.

---

## 3. Install / verify dependencies

```bash
bun add react-router-dom lucide-react
```

(Both are already installed in standard Lovable projects.)

---

## 4. Add the route

In `src/App.tsx`, import the page and register the route **above** the catch-all:

```tsx
import CVAnalyzer from "./pages/CVAnalyzer.tsx";

// inside <Routes>
<Route path="/cv-analyzer" element={<CVAnalyzer />} />
```

Add a navigation entry (header link or hero CTA) pointing to `/cv-analyzer`. Recommended primary CTA copy: **"Analyse my CV — free"**.

---

## 5. Create the page file

Create `src/pages/CVAnalyzer.tsx` with the contents in **Section 8** below.

Key implementation details:

- **State machine**: `type Phase = "idle" | "analyzing" | "complete"`.
- **Stage config**: 5 entries `{ icon, label, detail }` — Parsing → Reading context → Identifying skills → Matching pathways → Composing insights.
- **Animation loop**: A single `useEffect` keyed on `phase === "analyzing"` runs `requestAnimationFrame`, computes `t = elapsed / 1600`, applies ease-in-out `t < 0.5 ? 2t² : 1 - (-2t+2)² / 2`, and advances `stageIndex` when `t >= 1`. On the final stage it sets phase to `"complete"`.
- **Cleanup**: `cancelAnimationFrame(rafRef.current)` in the effect return.
- **Overall %**: `Math.round(((stageIndex + stageProgress / 100) / STAGES.length) * 100)`.
- **Drop handling**: `onDragOver={e => e.preventDefault()}` on the `<label>`, `onDrop` reads `e.dataTransfer.files?.[0]`. The `<input type="file">` is `sr-only` and the `<label htmlFor>` triggers it.
- **SVG ring**: `r=92`, `strokeWidth=4`, `strokeDasharray = 2π·92`, `strokeDashoffset = 2π·92·(1 - overall/100)`, rotated `-90deg` so 0% starts at top. Glow via `filter: drop-shadow(0 0 8px hsl(var(--secondary) / 0.4))`.
- **Active stage affordances**: pulsing icon (`animate-pulse`), `ring-2 ring-secondary/40 animate-ping` overlay, per-stage thin bar, and a tabular-nums % readout.

---

## 6. Tailwind / CSS fallbacks

If the host project is missing any of these, add them to `tailwind.config.ts` or `src/index.css`:

**`font-display`** — in `tailwind.config.ts`:
```ts
theme: { extend: { fontFamily: { display: ["'Fraunces'", "serif"] } } }
```
And import the font in `index.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400..900;1,400..900&display=swap');
```

**`animate-fade-up`** — in `tailwind.config.ts` keyframes/animation:
```ts
keyframes: {
  "fade-up": { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } }
},
animation: { "fade-up": "fade-up 0.5s ease-out both" }
```

**`shimmer`** utility (optional, used on the success CTA) — in `index.css`:
```css
@layer utilities {
  .shimmer { position: relative; overflow: hidden; }
  .shimmer::after {
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(110deg, transparent 30%, hsl(0 0% 100% / 0.25) 50%, transparent 70%);
    transform: translateX(-100%);
    animation: shimmer-sweep 2.4s ease-in-out infinite;
  }
  @keyframes shimmer-sweep { to { transform: translateX(100%); } }
}
```

**`Button` `variant="cta"`** — if absent, change `variant="cta"` to `variant="default"` in the success state CTA. Or add to `buttonVariants` in `src/components/ui/button.tsx`:
```ts
cta: "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:brightness-105 hover:-translate-y-0.5 transition-all font-semibold"
```

**Optional companion components** — if `ThemeToggle`, `ProfileMenu`, or `ContactWidget` don't exist in the host site, simply delete those imports and JSX usages. The page is self-contained without them.

---

## 7. Wiring to a real backend (optional)

The current page simulates analysis with a timed animation. To wire it to a real API:

1. In `handleFile`, upload the file via `fetch` / `FormData` to your endpoint.
2. Replace the `useEffect` RAF loop with polling (or a WebSocket / SSE stream) that updates `stageIndex` and `stageProgress` based on real backend events.
3. On terminal success/failure, set `phase` to `"complete"` (or add an `"error"` phase) and store the result in state for downstream pages.

Keep the visual structure unchanged so the premium UX stays intact.

---

## 8. Full source — `src/pages/CVAnalyzer.tsx`

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  FileText,
  Languages,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ContactWidget } from "@/components/ContactWidget";
import logo from "/empowerLogo.jpg";

type Phase = "idle" | "analyzing" | "complete";

const STAGES = [
  { icon: FileText,  label: "Parsing document",   detail: "Extracting structure, sections, and metadata" },
  { icon: Languages, label: "Reading context",    detail: "Understanding language, tone, and intent" },
  { icon: Brain,     label: "Identifying skills", detail: "Cross-referencing 12,400+ skill signals" },
  { icon: Target,    label: "Matching pathways",  detail: "Aligning with 5 career trajectories" },
  { icon: Sparkles,  label: "Composing insights", detail: "Crafting personalised recommendations" },
];

const STAGE_DURATION = 1600; // ms per stage

const CVAnalyzer = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [stageProgress, setStageProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (phase !== "analyzing") return;
    let stage = 0;
    let stageStart = performance.now();
    setStageIndex(0);
    setStageProgress(0);

    const tick = (now: number) => {
      const elapsed = now - stageStart;
      const t = Math.min(1, elapsed / STAGE_DURATION);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setStageProgress(Math.round(eased * 100));
      if (t >= 1) {
        if (stage < STAGES.length - 1) {
          stage += 1;
          setStageIndex(stage);
          setStageProgress(0);
          stageStart = now;
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setPhase("complete");
        }
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [phase]);

  const handleFile = useCallback((file: File) => {
    setFileName(file.name);
    setPhase("analyzing");
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setPhase("idle");
    setFileName(null);
    setStageIndex(0);
    setStageProgress(0);
  };

  const overall = Math.round(((stageIndex + stageProgress / 100) / STAGES.length) * 100);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Logo" className="h-9 w-9 rounded-md object-cover" width={36} height={36} />
            <span className="font-display text-xl font-bold tracking-tight text-primary">EmpowAI</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/"><ArrowLeft className="mr-1 h-4 w-4" />Back</Link>
            </Button>
            <ProfileMenu />
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <section className="container flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-16 sm:py-24">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-secondary" />
            CV Analyser · Mahala
          </span>

          <h1 className="mt-6 max-w-3xl text-center font-display text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
            {phase === "complete"  ? <>Your CV, <em className="font-display italic text-secondary">decoded.</em></>
            : phase === "analyzing"? <>Reading between the <em className="font-display italic text-secondary">lines.</em></>
            :                        <>Upload your CV. <em className="font-display italic text-secondary">We'll do the rest.</em></>}
          </h1>

          <p className="mt-4 max-w-xl text-center text-sm text-muted-foreground sm:text-base">
            {phase === "complete"   ? "Five career pathways matched, ranked by fit and earning potential."
            : phase === "analyzing" ? "Our AI is mapping your experience to opportunities across South Africa."
            :                         "PDF, DOCX, or plain text. Your data stays private."}
          </p>

          {phase === "idle" && (
            <div className="mt-12 w-full max-w-2xl animate-fade-up">
              <label
                htmlFor="cv-file"
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                className="group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-border bg-card/50 p-12 text-center transition-all hover:border-secondary hover:bg-card sm:p-16"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/10 text-secondary transition-transform group-hover:scale-110">
                  <Upload className="h-7 w-7" />
                </div>
                <p className="mt-6 font-display text-xl font-semibold text-foreground">Drop your CV here</p>
                <p className="mt-1 text-sm text-muted-foreground">or click to browse · max 10MB</p>
                <input
                  ref={inputRef} id="cv-file" type="file"
                  accept=".pdf,.doc,.docx,.txt" className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </label>

              <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-secondary" />POPIA compliant</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-secondary" />60-second results</span>
                <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-secondary" />Always free</span>
              </div>
            </div>
          )}

          {phase === "analyzing" && (
            <div className="mt-12 w-full max-w-2xl animate-fade-up">
              {fileName && (
                <div className="mx-auto mb-8 inline-flex max-w-full items-center gap-2 rounded-full border border-border/60 bg-card px-4 py-2 text-sm">
                  <FileText className="h-4 w-4 shrink-0 text-secondary" />
                  <span className="truncate font-medium">{fileName}</span>
                </div>
              )}

              <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 200 200">
                  <circle cx="100" cy="100" r="92" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                  <circle
                    cx="100" cy="100" r="92" fill="none"
                    stroke="hsl(var(--secondary))" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 92}`}
                    strokeDashoffset={`${2 * Math.PI * 92 * (1 - overall / 100)}`}
                    className="transition-[stroke-dashoffset] duration-300 ease-out"
                    style={{ filter: "drop-shadow(0 0 8px hsl(var(--secondary) / 0.4))" }}
                  />
                </svg>
                <div className="absolute inset-6 rounded-full bg-secondary/5 blur-2xl animate-pulse" />
                <div className="relative flex flex-col items-center">
                  <span className="font-display text-5xl font-bold tabular-nums text-primary">
                    {overall}<span className="text-2xl text-muted-foreground">%</span>
                  </span>
                  <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Analysing</span>
                </div>
              </div>

              <ol className="mt-10 space-y-1">
                {STAGES.map((stage, i) => {
                  const Icon = stage.icon;
                  const isDone = i < stageIndex;
                  const isActive = i === stageIndex;
                  const isPending = i > stageIndex;
                  return (
                    <li
                      key={stage.label}
                      className={`relative flex items-start gap-4 rounded-2xl px-4 py-3 transition-all duration-500 ${isActive ? "bg-card shadow-sm" : "bg-transparent"} ${isPending ? "opacity-40" : "opacity-100"}`}
                    >
                      <div className={`relative mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all ${isDone ? "bg-secondary text-white" : isActive ? "bg-secondary/10 text-secondary" : "bg-muted text-muted-foreground"}`}>
                        {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className={`h-4 w-4 ${isActive ? "animate-pulse" : ""}`} />}
                        {isActive && <span className="absolute inset-0 rounded-xl ring-2 ring-secondary/40 animate-ping" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <p className={`text-sm font-semibold ${isActive || isDone ? "text-foreground" : "text-muted-foreground"}`}>{stage.label}</p>
                          {isActive && <span className="text-xs font-medium tabular-nums text-secondary">{stageProgress}%</span>}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{stage.detail}</p>
                        {isActive && (
                          <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-secondary transition-[width] duration-200 ease-out" style={{ width: `${stageProgress}%` }} />
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>

              <div className="mt-8 text-center">
                <button onClick={reset} className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  Cancel analysis
                </button>
              </div>
            </div>
          )}

          {phase === "complete" && (
            <div className="mt-12 w-full max-w-xl animate-fade-up text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <p className="mt-6 text-base text-muted-foreground">
                Analysis complete. We found <span className="font-semibold text-foreground">5 strong career matches</span> based on your experience.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button variant="cta" size="lg" onClick={() => navigate("/demo")} className="shimmer">
                  See your matches<ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button variant="ghost" size="lg" onClick={reset}>Analyse another CV</Button>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="container py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EmpowAI
        </div>
      </footer>

      <ContactWidget />
    </div>
  );
};

export default CVAnalyzer;
```

---

## 9. QA checklist

- [ ] `/cv-analyzer` route renders without console errors.
- [ ] Drag-and-drop and click-to-browse both trigger the `analyzing` phase.
- [ ] All 5 stages light up sequentially; the active row pulses and shows a per-stage %.
- [ ] The SVG ring fills smoothly from 0 → 100%.
- [ ] After ~8 seconds the page transitions to the success state.
- [ ] "Analyse another CV" returns to the upload zone.
- [ ] Light and dark mode both look correct (all colors come from semantic tokens).
- [ ] No hardcoded hex/rgb colors anywhere in the file.
- [ ] Mobile (≤640px): layout stays centered, ring + stage list don't overflow.

---

That's the entire spec. Drop this file into the receiving project's docs and have the AI follow Sections 4 → 5 → 6 in order.


---

## 10. Digital Twin page (Step 2 of the flow)

After the CV Analyzer, users land on `/digital-twin` to build an AI persona of themselves. This page completes the funnel: **CV Analyzer → Digital Twin → Opportunities / Interview Coach**.

### Flow & state machine

A single page with 5 sequential steps tracked by `stepIndex`:

1. **Identity** — name (required) + optional one-line tagline.
2. **Strengths** — pick 3–5 from a chip cloud of 10 traits.
3. **Interests** — pick 1–4 domain cards (Business, Education, Technology, Healthcare, Creative arts, Social impact).
4. **Goals** — pick up to 3 from a 12-month outcome list.
5. **Build** — RAF-driven synthesis animation (~3.2s) → twin summary card.

A horizontal stepper at the top shows all 5 steps with done / active / pending states (same visual language as the CV Analyzer stage list: filled secondary for done, ring + ping for active, muted for pending). Overall progress bar above the stepper combines `stepIndex` with the in-progress build %.

### Validation rules (`canAdvance`)

| Step | Required to continue |
|---|---|
| `identity`  | `name.trim().length > 1` |
| `strengths` | `strengths.length >= 3` |
| `interests` | `interests.length >= 1` |
| `goals`     | `goals.length >= 1` |
| `build`     | always true (auto-advances when animation finishes) |

The "Continue" button is disabled until the current step's rule passes. On the last input step (`goals`) the button label switches to **"Build my twin"**.

### Build animation

Same RAF + ease-in-out curve as the CV Analyzer (`t < 0.5 ? 2t² : 1 - (-2t+2)² / 2`), 3200ms total, drives a single overall % into the SVG ring (no sub-stages this time). When `t >= 1` it sets `twinReady = true` and swaps the ring card for the twin summary card.

### Twin summary card (success state)

Displays:
- A `Sparkles` icon avatar in a `bg-secondary/10` rounded square.
- The user's `name` in `font-display`, with the optional `tagline` in italic muted text.
- Three sections: **Strengths** (secondary-tinted pill chips), **Interests** (muted pill chips), **12-month goals** (checklist with secondary check icons).

Two CTAs at the bottom:
- Primary `cta` → `navigate("/demo")` labelled **"Explore opportunities"**.
- Ghost → resets `stepIndex` and `twinReady` to let the user **"Edit my twin"**.

### Routing changes

In `src/App.tsx`:

```tsx
import DigitalTwin from "./pages/DigitalTwin.tsx";

// inside <Routes>, above the catch-all
<Route path="/digital-twin" element={<DigitalTwin />} />
```

In `src/pages/CVAnalyzer.tsx`, the success state CTA must point to `/digital-twin` instead of `/demo`. Replace the success block's primary button with:

```tsx
<Button variant="cta" size="lg" onClick={() => navigate("/digital-twin")} className="shimmer">
  Build my digital twin
  <ArrowRight className="ml-1 h-4 w-4" />
</Button>
```

And update the surrounding copy to reference the digital twin (not "5 career matches").

### Reusable design tokens / patterns

The Digital Twin page reuses every primitive established by the CV Analyzer — no new Tailwind config or CSS utilities needed:

- `font-display` for the H1.
- Ambient orbs (`bg-primary/10` + `bg-secondary/10` blurred circles) behind `<main>`.
- Pill eyebrow with `Sparkles` + `tracking-[0.18em] uppercase` text.
- Stepper icons, `ring-2 ring-secondary/40 animate-ping` on active.
- SVG ring with `r=92`, `strokeDasharray = 2π·92`, secondary stroke + drop-shadow glow.
- All colors via semantic HSL tokens — no hex / rgb anywhere.

### Full source — `src/pages/DigitalTwin.tsx`

```tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Briefcase,
  CheckCircle2,
  Compass,
  GraduationCap,
  Heart,
  Sparkles,
  Target,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ProfileMenu } from "@/components/ProfileMenu";
import { ContactWidget } from "@/components/ContactWidget";
import logo from "/empowerLogo.jpg";

type StepId = "identity" | "strengths" | "interests" | "goals" | "build";

const STEPS: { id: StepId; label: string; icon: typeof User }[] = [
  { id: "identity",  label: "Identity",  icon: User },
  { id: "strengths", label: "Strengths", icon: Brain },
  { id: "interests", label: "Interests", icon: Heart },
  { id: "goals",     label: "Goals",     icon: Target },
  { id: "build",     label: "Build",     icon: Sparkles },
];

const STRENGTHS = [
  "Communication", "Problem solving", "Leadership", "Creativity",
  "Analytical thinking", "Empathy", "Resilience", "Curiosity",
  "Collaboration", "Discipline",
];

const INTERESTS = [
  { icon: Briefcase,      label: "Business" },
  { icon: GraduationCap,  label: "Education" },
  { icon: Brain,          label: "Technology" },
  { icon: Heart,          label: "Healthcare" },
  { icon: Compass,        label: "Creative arts" },
  { icon: Target,         label: "Social impact" },
];

const GOALS = [
  "Earn R20k+ within 12 months",
  "Work remotely",
  "Start my own business",
  "Lead a team",
  "Make a social impact",
  "Keep learning new skills",
];

const DigitalTwin = () => {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [strengths, setStrengths] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [buildProgress, setBuildProgress] = useState(0);
  const [twinReady, setTwinReady] = useState(false);

  const currentStep = STEPS[stepIndex];

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string, max = 5) => {
    if (arr.includes(val)) setArr(arr.filter(x => x !== val));
    else if (arr.length < max) setArr([...arr, val]);
  };

  const canAdvance = () => {
    if (currentStep.id === "identity")  return name.trim().length > 1;
    if (currentStep.id === "strengths") return strengths.length >= 3;
    if (currentStep.id === "interests") return interests.length >= 1;
    if (currentStep.id === "goals")     return goals.length >= 1;
    return true;
  };

  // Build animation
  useEffect(() => {
    if (currentStep.id !== "build") return;
    setBuildProgress(0);
    setTwinReady(false);
    const start = performance.now();
    const DURATION = 3200;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setBuildProgress(Math.round(eased * 100));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setTwinReady(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [currentStep.id]);

  const next = () => setStepIndex(i => Math.min(STEPS.length - 1, i + 1));
  const back = () => setStepIndex(i => Math.max(0, i - 1));

  const overallPct = Math.round(((stepIndex + (currentStep.id === "build" ? buildProgress / 100 : 0)) / STEPS.length) * 100);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="EmpowAI logo" className="h-9 w-9 rounded-md object-cover" width={36} height={36} />
            <span className="font-display text-xl font-bold tracking-tight text-primary">EmpowAI</span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link to="/cv-analyzer"><ArrowLeft className="mr-1 h-4 w-4" />Back</Link>
            </Button>
            <ProfileMenu />
          </div>
        </div>
      </header>

      <main className="relative overflow-hidden">
        {/* Ambient orbs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        </div>

        <section className="container flex min-h-[calc(100vh-4rem)] flex-col items-center py-12 sm:py-16">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Sparkles className="h-3 w-3 text-secondary" />
            Step 2 · Digital Twin
          </span>

          <h1 className="mt-6 max-w-3xl text-center font-display text-4xl font-bold tracking-tight text-primary sm:text-5xl md:text-6xl">
            {twinReady ? (
              <>Meet your <em className="font-display italic text-secondary">twin.</em></>
            ) : currentStep.id === "build" ? (
              <>Bringing it all <em className="font-display italic text-secondary">to life.</em></>
            ) : (
              <>Build your <em className="font-display italic text-secondary">digital twin.</em></>
            )}
          </h1>

          <p className="mt-4 max-w-xl text-center text-sm text-muted-foreground sm:text-base">
            {twinReady
              ? "An AI version of you, ready to explore opportunities and rehearse interviews."
              : currentStep.id === "build"
              ? "We're synthesising your CV with everything you just told us."
              : "Tell us who you are. Your twin learns from your CV plus what only you know."}
          </p>

          {/* Stepper */}
          <div className="mt-10 w-full max-w-2xl">
            <div className="mb-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span>{currentStep.label}</span>
              <span className="tabular-nums">{overallPct}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-secondary transition-[width] duration-500 ease-out"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <ol className="mt-5 grid grid-cols-5 gap-2">
              {STEPS.map((s, i) => {
                const Icon = s.icon;
                const done = i < stepIndex;
                const active = i === stepIndex;
                return (
                  <li key={s.id} className="flex flex-col items-center gap-2">
                    <div className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                      done ? "bg-secondary text-white"
                      : active ? "bg-secondary/10 text-secondary"
                      : "bg-muted text-muted-foreground"
                    }`}>
                      {done ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                      {active && <span className="absolute inset-0 rounded-xl ring-2 ring-secondary/40 animate-ping" />}
                    </div>
                    <span className={`text-[10px] font-medium uppercase tracking-wider ${active || done ? "text-foreground" : "text-muted-foreground"}`}>
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Step body */}
          <div className="mt-10 w-full max-w-2xl animate-fade-up">
            {currentStep.id === "identity" && (
              <div className="rounded-3xl border border-border/60 bg-card/50 p-8 sm:p-10">
                <label className="block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Your name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Thandi Mokoena"
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-secondary"
                  />
                </label>
                <label className="mt-6 block">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">A line that describes you</span>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Curious problem-solver from Soweto"
                    className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-secondary"
                  />
                  <span className="mt-2 block text-xs text-muted-foreground">Optional. Skip if you'd rather your twin discover it.</span>
                </label>
              </div>
            )}

            {currentStep.id === "strengths" && (
              <div className="rounded-3xl border border-border/60 bg-card/50 p-8 sm:p-10">
                <p className="text-sm text-muted-foreground">Pick 3–5 that feel most like you.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {STRENGTHS.map((s) => {
                    const on = strengths.includes(s);
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => toggle(strengths, setStrengths, s, 5)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                          on
                            ? "border-secondary bg-secondary text-white shadow-sm"
                            : "border-border bg-background text-foreground hover:border-secondary/60"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">{strengths.length}/5 selected</p>
              </div>
            )}

            {currentStep.id === "interests" && (
              <div className="rounded-3xl border border-border/60 bg-card/50 p-8 sm:p-10">
                <p className="text-sm text-muted-foreground">Where does your curiosity pull you?</p>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {INTERESTS.map(({ icon: Icon, label }) => {
                    const on = interests.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggle(interests, setInterests, label, 4)}
                        className={`flex flex-col items-center gap-2 rounded-2xl border p-5 text-sm font-medium transition-all ${
                          on
                            ? "border-secondary bg-secondary/10 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-secondary/60 hover:text-foreground"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${on ? "text-secondary" : ""}`} />
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep.id === "goals" && (
              <div className="rounded-3xl border border-border/60 bg-card/50 p-8 sm:p-10">
                <p className="text-sm text-muted-foreground">What does success look like in 12 months?</p>
                <div className="mt-5 space-y-2">
                  {GOALS.map((g) => {
                    const on = goals.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggle(goals, setGoals, g, 3)}
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                          on
                            ? "border-secondary bg-secondary/10 text-foreground"
                            : "border-border bg-background text-foreground hover:border-secondary/60"
                        }`}
                      >
                        <span>{g}</span>
                        {on && <CheckCircle2 className="h-4 w-4 text-secondary" />}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-4 text-xs text-muted-foreground">{goals.length}/3 selected</p>
              </div>
            )}

            {currentStep.id === "build" && !twinReady && (
              <div className="rounded-3xl border border-border/60 bg-card/50 p-10 text-center">
                <div className="relative mx-auto flex h-40 w-40 items-center justify-center">
                  <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="92" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                    <circle
                      cx="100" cy="100" r="92" fill="none"
                      stroke="hsl(var(--secondary))" strokeWidth="4" strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 92}`}
                      strokeDashoffset={`${2 * Math.PI * 92 * (1 - buildProgress / 100)}`}
                      className="transition-[stroke-dashoffset] duration-300 ease-out"
                      style={{ filter: "drop-shadow(0 0 8px hsl(var(--secondary) / 0.4))" }}
                    />
                  </svg>
                  <div className="absolute inset-4 rounded-full bg-secondary/5 blur-2xl animate-pulse" />
                  <div className="relative flex flex-col items-center">
                    <span className="font-display text-3xl font-bold tabular-nums text-primary">{buildProgress}%</span>
                    <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Synthesising</span>
                  </div>
                </div>
                <p className="mt-6 text-sm text-muted-foreground">Weaving your CV, strengths, interests, and goals into a single AI persona.</p>
              </div>
            )}

            {currentStep.id === "build" && twinReady && (
              <div className="rounded-3xl border border-border/60 bg-card p-8 sm:p-10">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Your digital twin</p>
                    <p className="mt-1 font-display text-2xl font-bold text-primary">{name || "Your twin"}</p>
                    {tagline && <p className="mt-1 text-sm italic text-muted-foreground">"{tagline}"</p>}
                  </div>
                </div>

                <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Strengths</dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {strengths.map(s => (
                        <span key={s} className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-medium text-secondary">{s}</span>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Interests</dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {interests.map(s => (
                        <span key={s} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">{s}</span>
                      ))}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">12-month goals</dt>
                    <dd className="mt-2 space-y-1.5">
                      {goals.map(g => (
                        <p key={g} className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />{g}
                        </p>
                      ))}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>

          {/* Nav */}
          <div className="mt-10 flex w-full max-w-2xl items-center justify-between gap-3">
            {!twinReady ? (
              <>
                <Button variant="ghost" onClick={back} disabled={stepIndex === 0}>
                  <ArrowLeft className="mr-1 h-4 w-4" />Back
                </Button>
                {currentStep.id !== "build" && (
                  <Button variant="cta" size="lg" onClick={next} disabled={!canAdvance()} className="shimmer">
                    {stepIndex === STEPS.length - 2 ? "Build my twin" : "Continue"}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </>
            ) : (
              <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button variant="cta" size="lg" onClick={() => navigate("/demo")} className="shimmer">
                  Explore opportunities<ArrowRight className="ml-1 h-4 w-4" />
                </Button>
                <Button variant="ghost" size="lg" onClick={() => { setStepIndex(0); setTwinReady(false); }}>
                  Edit my twin
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="container py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} EmpowAI · Amandla e-Ubuntu 🇿🇦
        </div>
      </footer>

      <ContactWidget />
    </div>
  );
};

export default DigitalTwin;

```

### Updated QA checklist

In addition to the CV Analyzer checklist:

- [ ] `/digital-twin` renders without console errors.
- [ ] Stepper advances only when validation passes.
- [ ] Selecting a 6th strength does nothing (capped at 5); same for interests (4) and goals (3).
- [ ] The build ring animates from 0 → 100% over ~3.2s and then swaps to the twin summary card.
- [ ] The twin summary correctly shows the user's name, tagline, strengths, interests, and goals.
- [ ] "Edit my twin" resets cleanly back to step 1 with previous selections preserved.
- [ ] CV Analyzer success CTA navigates to `/digital-twin` (not `/demo`).
- [ ] Digital Twin success CTA navigates to `/demo` (opportunities / interview coach).

---

That's the complete two-page funnel. The receiving AI should follow Sections 4 → 5 → 6 for the CV Analyzer first, then Section 10 for the Digital Twin.
