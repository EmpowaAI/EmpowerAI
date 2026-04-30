import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export const ROICalculator = () => {
  const [current, setCurrent] = useState(2500);

  const projection = useMemo(() => {
    // Without EmpowAI: ~3% growth/yr. With: ~28% growth/yr (front-end mock)
    const years = [0, 1, 2, 3, 4, 5];
    return years.map((y) => ({
      year: y,
      without: Math.round(current * Math.pow(1.03, y)),
      with: Math.round(Math.max(current, 1500) * Math.pow(1.28, y) + 800 * y),
    }));
  }, [current]);

  const final = projection[projection.length - 1];
  const gain = final.with - final.without;
  const max = Math.max(...projection.map((p) => p.with));

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            Bala Imali Yakho — Your 5-Year Outlook
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-primary md:text-4xl">
            What could R50/month earn you back?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Slide your current monthly income. We'll project your earnings — with and without EmpowAI guidance.
          </p>
        </div>

        <Card className="mx-auto mt-10 max-w-4xl border-border/70 bg-card p-6 shadow-card-soft md:p-10">
          <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                I currently earn
              </label>
              <div className="mt-2 font-display text-4xl font-bold text-primary tabular-nums">
                R{current.toLocaleString()}
                <span className="ml-1 text-base font-normal text-muted-foreground">/month</span>
              </div>
              <Slider
                value={[current]}
                onValueChange={(v) => setCurrent(v[0])}
                min={0}
                max={20000}
                step={250}
                className="mt-5"
              />
              <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
                <span>R0</span>
                <span>R20,000</span>
              </div>
            </div>

            <div className="rounded-2xl border border-secondary/30 bg-secondary/5 p-6 text-center md:min-w-[220px]">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                5-year gain
              </div>
              <div className="mt-1 font-display text-3xl font-bold text-secondary tabular-nums">
                +R{gain.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground">
                /month projected
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div className="mt-8 grid grid-cols-6 gap-2 md:gap-4">
            {projection.map((p) => (
              <div key={p.year} className="flex flex-col items-center gap-2">
                <div className="relative flex h-40 w-full items-end justify-center gap-1">
                  <div
                    className="w-1/2 rounded-t-md bg-muted-foreground/30 transition-all duration-500"
                    style={{ height: `${(p.without / max) * 100}%` }}
                    title={`Without: R${p.without.toLocaleString()}`}
                  />
                  <div
                    className="w-1/2 rounded-t-md bg-cta-gradient shadow-cta transition-all duration-500"
                    style={{ height: `${(p.with / max) * 100}%` }}
                    title={`With EmpowAI: R${p.with.toLocaleString()}`}
                  />
                </div>
                <div className="text-[10px] font-semibold text-muted-foreground">
                  {p.year === 0 ? "Now" : `Y${p.year}`}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs">
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-muted-foreground/30" />
              Without guidance
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-cta-gradient" />
              With EmpowAI
            </span>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild variant="cta" size="lg" className="shimmer">
              <Link to="/pricing">
                <Sparkles className="mr-1 h-4 w-4" />
                Unlock my path — R50/mo
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/demo">
                Try the free CV analyser
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            <TrendingUp className="mr-1 inline h-3 w-3" />
            Projections based on average EmpowAI user outcomes. Your results may vary.
          </p>
        </Card>
      </div>
    </section>
  );
};
