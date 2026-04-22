import { useEffect, useMemo, useState } from "react";
import Button from "./ui/Button";
// Using a standard div with card styles as fallback if Card component isn't globally available
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
import { useReveal } from "../hooks/use-reveal";

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

  useEffect(() => {
    if (step !== 1) return;
    setProgress(0);
    const start = performance.now();
    const duration = 2400;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
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

  const stepLabels = useMemo(() => ["Upload", "Analyse", "Explore", "Match"], []);

  return (
    <section id="demo" ref={ref} className="relative overflow-hidden bg-background py-16 sm:py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute left-1/2 top-0 h-72 w-[120%] -translate-x-1/2 rounded-full bg-secondary/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className={`mx-auto max-w-2xl text-center transition-all duration-700 ${revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
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

        <div className={`mx-auto mt-8 flex max-w-md items-center justify-between gap-2 transition-all duration-700 delay-100 ${revealed ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
          {stepLabels.map((label, i) => {
            const active = i <= step;
            const current = i === step;
            return (
              <div key={label} className="flex flex-1 items-center gap-2">
                <div className="flex flex-col items-center gap-1.5">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-500 ${active ? "bg-primary text-primary-foreground scale-100" : "bg-muted text-muted-foreground scale-90"} ${current ? "ring-4 ring-secondary/30 animate-glow-pulse" : ""}`}>
                    {i + 1}
                  </span>
                  <span className={`hidden text-[10px] font-semibold uppercase tracking-wider sm:inline ${active ? "text-primary" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="absolute inset-y-0 left-0 bg-secondary transition-all duration-700 ease-out" style={{ width: i < step ? "100%" : "0%" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={`mx-auto mt-8 max-w-3xl transition-all duration-700 delay-200 ${revealed ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 shadow-card-soft sm:p-7 md:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-secondary/60 to-transparent" />

            {step === 0 && (
              <div className="animate-slide-up">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <div className="absolute inset-0 animate-pulse bg-primary/20 rounded-2xl" aria-hidden />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-ai-gradient text-white shadow-glow">
                      <FileText className="h-9 w-9" strokeWidth={1.8} />
                    </div>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold text-primary sm:text-xl">Drop your CV — or use ours</h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">For this demo we'll use Siyanda's CV. Tap below and watch the AI go to work.</p>
                  <div className="mt-6 flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Button variant="cta" size="xl" className="shimmer w-full sm:w-auto" onClick={() => setStep(1)}>
                      <Play className="mr-1 h-4 w-4" /> Run the demo
                    </Button>
                    <Button variant="outline" size="xl" className="w-full sm:w-auto">Upload my own CV</Button>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-secondary" />No sign-up</span>
                    <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-secondary" />POPIA compliant</span>
                    <span className="inline-flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-secondary" />Free forever — Mahala</span>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="animate-slide-up">
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Loader2 className="h-7 w-7 animate-spin" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-bold text-primary sm:text-xl">Analysing CV…</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Neural matching engine · 11,400+ skills graph</p>
                  <div className="mt-6 w-full max-w-md">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                      <span>Progress</span>
                      <span className="font-display text-primary">{progress}%</span>
                    </div>
                    <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-cta-gradient transition-[width] duration-150 ease-out" style={{ width: `${progress}%` }} />
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
                          <li key={row.label} className={`flex items-center gap-2 transition-colors ${done ? "text-primary" : "text-muted-foreground/70"}`}>
                            {done ? <CheckCircle2 className="h-4 w-4 text-secondary" /> : <span className="h-4 w-4 rounded-full border border-border" />}
                            <span className="font-medium">{row.label}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-slide-up">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary">Step 3 of 4</span>
                    <h3 className="mt-1 font-display text-lg font-bold text-primary sm:text-xl">Your 5 best-fit paths</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Empowerment Score</div>
                    <div className="font-display text-2xl font-bold text-primary">78<span className="text-sm text-muted-foreground">/100</span></div>
                  </div>
                </div>
                <ul className="mt-5 space-y-2.5">
                  {PATHS.map((p, i) => {
                    const Icon = p.icon;
                    const isChosen = chosen === i;
                    return (
                      <li key={p.name} style={{ animationDelay: `${i * 70}ms` }} className="animate-slide-up">
                        <button type="button" onClick={() => setChosen(i)} className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all duration-300 sm:p-4 ${isChosen ? "border-secondary bg-secondary/5 shadow-glow" : "border-border/70 bg-background hover:-translate-y-0.5 hover:border-secondary/50 hover:shadow-card-soft"}`}>
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${p.tone} text-white transition-transform duration-300 group-hover:scale-110 sm:h-11 sm:w-11`}>
                            <Icon className="h-5 w-5" strokeWidth={2.2} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate font-display text-sm font-bold text-primary sm:text-base">{p.name}</span>
                              <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">{p.match}% match</span>
                            </div>
                            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div className="h-full rounded-full bg-cta-gradient transition-[width] duration-700 ease-out" style={{ width: `${p.match}%` }} />
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                              <span className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3 text-secondary" />{p.income}/mo</span>
                              <span>· {p.time} to first gig</span>
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <Button variant="outline" size="sm" onClick={reset}><RotateCcw className="mr-1 h-3.5 w-3.5" />Restart</Button>
                  <Button variant="cta" size="xl" disabled={chosen === null} onClick={() => setStep(3)} className="shimmer w-full sm:w-auto">{chosen === null ? "Pick a path to continue" : "Lock it in"}<ArrowRight className="ml-1 h-4 w-4" /></Button>
                </div>
              </div>
            )}

            {step === 3 && chosen !== null && (
              <div className="animate-slide-up">
                <div className="flex flex-col items-center text-center">
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-ai-gradient text-white shadow-glow"><CheckCircle2 className="h-10 w-10" strokeWidth={1.8} /></div>
                  <span className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-secondary">Siyaqala! · Let's begin</span>
                  <h3 className="mt-1 font-display text-xl font-bold text-primary sm:text-2xl">{PATHS[chosen].name} — your path</h3>
                  <p className="mt-2 max-w-sm text-sm text-muted-foreground">{PATHS[chosen].match}% match · projected <span className="font-semibold text-primary">{PATHS[chosen].income}/month</span> within {PATHS[chosen].time}.</p>
                  <div className="mt-5 grid w-full max-w-md grid-cols-3 gap-2 sm:gap-3">
                    {[{ v: "12", l: "Free modules" }, { v: "3", l: "Mentors matched" }, { v: "47", l: "Local gigs" }].map((s) => (
                      <div key={s.l} className="rounded-lg border border-border/60 bg-background p-3 text-center">
                        <div className="font-display text-lg font-bold text-primary sm:text-xl">{s.v}</div>
                        <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground sm:text-[11px]">{s.l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex w-full flex-col-reverse items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Button variant="outline" size="xl" onClick={reset} className="w-full sm:w-auto"><RotateCcw className="mr-1 h-4 w-4" />Run again</Button>
                    <Button variant="cta" size="xl" className="shimmer w-full sm:w-auto">Start my real journey<ArrowRight className="ml-1 h-4 w-4" /></Button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <p className="mt-3 text-center text-[11px] text-muted-foreground">Demo data based on Siyanda's actual journey · numbers anonymised</p>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;