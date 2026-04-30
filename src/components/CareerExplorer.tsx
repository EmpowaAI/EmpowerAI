import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  Wrench,
  Store,
  Landmark,
  Palette,
  HeartPulse,
  Sprout,
  Truck,
  TrendingUp,
  Clock,
  Flame,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PATHS = [
  { id: "tech", name: "Tech Skills", icon: Code2, salary: "R8k–R45k", time: "4–8 weeks", demand: 92, growth: "+18%/yr", desc: "Junior dev, data entry, QA, support engineer." },
  { id: "trades", name: "Skilled Trades", icon: Wrench, salary: "R6k–R28k", time: "8–16 weeks", demand: 84, growth: "+11%/yr", desc: "Electrician, plumber, welder, solar installer." },
  { id: "smme", name: "SMME / Hustle", icon: Store, salary: "R3k–R60k+", time: "2–6 weeks", demand: 78, growth: "+22%/yr", desc: "Spaza shop, online reseller, services agency." },
  { id: "gov", name: "Government & NGO", icon: Landmark, salary: "R7k–R32k", time: "12–24 weeks", demand: 64, growth: "+5%/yr", desc: "Admin, learnerships, community programs." },
  { id: "creative", name: "Creative", icon: Palette, salary: "R4k–R40k", time: "6–12 weeks", demand: 71, growth: "+14%/yr", desc: "Content, design, video, social media." },
  { id: "health", name: "Care & Health", icon: HeartPulse, salary: "R6k–R22k", time: "10–20 weeks", demand: 88, growth: "+16%/yr", desc: "Carer, home health, medical admin." },
  { id: "agri", name: "Agri & Green", icon: Sprout, salary: "R5k–R26k", time: "8–14 weeks", demand: 69, growth: "+19%/yr", desc: "Urban farming, recycling, eco-tourism." },
  { id: "logi", name: "Logistics", icon: Truck, salary: "R6k–R30k", time: "4–10 weeks", demand: 81, growth: "+12%/yr", desc: "Delivery, warehouse, courier ops." },
];

export const CareerExplorer = () => {
  const [active, setActive] = useState(PATHS[0]);

  return (
    <section className="bg-muted/40 py-20">
      <div className="container">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            Hlola Indlela — Explore the Map
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold text-primary md:text-4xl">
            Eight career universes. One click each.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Hover or tap a path to see real Mzansi salary ranges, demand, and how fast you can start earning.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* Path grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            {PATHS.map((p) => {
              const Icon = p.icon;
              const isActive = active.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActive(p)}
                  onMouseEnter={() => setActive(p)}
                  className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-300 ${
                    isActive
                      ? "border-secondary bg-card shadow-cta -translate-y-1"
                      : "border-border/70 bg-card/60 hover:border-secondary/50 hover:-translate-y-0.5"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary/10 text-primary group-hover:bg-secondary/20"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mt-3 text-sm font-bold text-primary">{p.name}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">{p.salary}</div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-secondary">
                    <Flame className="h-2.5 w-2.5" />
                    {p.demand}% demand
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          <Card key={active.id} className="animate-fade-in border-border/70 bg-card p-7 shadow-card-soft">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cta-gradient text-white shadow-cta">
                <active.icon className="h-7 w-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-2xl font-bold text-primary">{active.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{active.desc}</p>
              </div>
              <Badge variant="secondary" className="shrink-0">
                <Flame className="mr-1 h-3 w-3" />
                {active.demand}%
              </Badge>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border/60 bg-background p-4">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Salary range
                </div>
                <div className="mt-1 font-display text-lg font-bold text-primary">{active.salary}</div>
              </div>
              <div className="rounded-lg border border-border/60 bg-background p-4">
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" /> Time to first gig
                </div>
                <div className="mt-1 font-display text-lg font-bold text-primary">{active.time}</div>
              </div>
              <div className="rounded-lg border border-border/60 bg-background p-4">
                <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <TrendingUp className="h-2.5 w-2.5" /> Growth
                </div>
                <div className="mt-1 font-display text-lg font-bold text-secondary">{active.growth}</div>
              </div>
            </div>

            {/* Demand bar */}
            <div className="mt-6">
              <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                <span>National demand</span>
                <span className="text-secondary">{active.demand}/100</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-cta-gradient transition-all duration-700"
                  style={{ width: `${active.demand}%` }}
                />
              </div>
            </div>

            <Button asChild variant="cta" className="mt-6 w-full shimmer">
              <Link to="/demo">
                Explore this path
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
};
