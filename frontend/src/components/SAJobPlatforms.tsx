import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ExternalLink, CheckCircle, Circle } from "lucide-react";
import GlassCard from "../components/GlassCard";

interface Platform {
  id: string;
  name: string;
  url: string;
  description: string;
  category: "jobs" | "youth" | "government" | "freelance";
}

const SA_PLATFORMS: Platform[] = [
  { id: "linkedin-sa", name: "LinkedIn South Africa", url: "https://www.linkedin.com/jobs/south-africa-jobs/", description: "Professional network & job listings", category: "jobs" },
  { id: "sayouthmobi", name: "SA Youth Mobi", url: "https://sayouth.mobi/", description: "Youth employment & opportunities portal", category: "youth" },
  { id: "careers24", name: "Careers24", url: "https://www.careers24.com/", description: "Top SA job board with thousands of listings", category: "jobs" },
  { id: "pnet", name: "PNet", url: "https://www.pnet.co.za/", description: "Leading SA recruitment & job platform", category: "jobs" },
  { id: "indeed-sa", name: "Indeed South Africa", url: "https://za.indeed.com/", description: "Global job search, localised for SA", category: "jobs" },
  { id: "joburg-gov", name: "Joburg City Jobs", url: "https://www.joburg.org.za/work_/Pages/Work%20in%20Joburg/Vacancies/Vacancies.aspx", description: "City of Joburg government vacancies", category: "government" },
  { id: "dpsa", name: "DPSA Vacancies", url: "https://www.dpsa.gov.za/dpsa2g/vacancies.asp", description: "Department of Public Service vacancies", category: "government" },
  { id: "yes4youth", name: "YES4Youth", url: "https://www.yes4youth.co.za/", description: "Youth Employment Service for 18-35s", category: "youth" },
  { id: "harambee", name: "Harambee", url: "https://www.harambee.co.za/", description: "Youth employment accelerator", category: "youth" },
  { id: "offerzen", name: "OfferZen", url: "https://www.offerzen.com/", description: "Tech job marketplace for developers", category: "jobs" },
  { id: "gumtree-jobs", name: "Gumtree Jobs SA", url: "https://www.gumtree.co.za/s-jobs/v1c8p1", description: "Classifieds with local job listings", category: "jobs" },
  { id: "nsfas", name: "NSFAS", url: "https://www.nsfas.org.za/", description: "National Student Financial Aid Scheme", category: "youth" },
];

const STORAGE_KEY = "sa-platforms-checked";

export default function SAJobPlatforms() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const [filter, setFilter] = useState<"all" | Platform["category"]>("all");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const toggle = (id: string) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filtered = filter === "all" ? SA_PLATFORMS : SA_PLATFORMS.filter(p => p.category === filter);
  const completedCount = SA_PLATFORMS.filter(p => checked[p.id]).length;
  const progress = Math.round((completedCount / SA_PLATFORMS.length) * 100);

  const categories: { value: "all" | Platform["category"]; label: string }[] = [
    { value: "all", label: "All" },
    { value: "jobs", label: "Job Boards" },
    { value: "youth", label: "Youth" },
    { value: "government", label: "Government" },
  ];

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display font-bold text-base">🇿🇦 SA Job Platforms Checklist</h3>
        <span className="text-xs font-semibold text-primary">{completedCount}/{SA_PLATFORMS.length}</span>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Register on these platforms to maximise your visibility. Tick them off as you go.
      </p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-muted-foreground">Progress</span>
          <span className="text-xs font-bold text-primary">{progress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-sa-green"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              filter === cat.value
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Platform list */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {filtered.map((platform, i) => (
          <motion.div
            key={platform.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
              checked[platform.id]
                ? "border-sa-green/30 bg-sa-green/5"
                : "border-border bg-card/60 hover:border-primary/30"
            }`}
            onClick={() => toggle(platform.id)}
          >
            <button className="shrink-0">
              {checked[platform.id] ? (
                <CheckCircle className="h-5 w-5 text-sa-green" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground/40" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate ${checked[platform.id] ? "line-through text-muted-foreground" : ""}`}>
                {platform.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{platform.description}</p>
            </div>
            <a
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="shrink-0 p-1.5 rounded-lg hover:bg-primary/10 transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-primary" />
            </a>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}
