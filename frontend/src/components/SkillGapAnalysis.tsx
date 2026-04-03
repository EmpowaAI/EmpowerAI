import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, AlertTriangle, Plus, ArrowRight, Code, TestTube, Shield, Briefcase, Award } from "lucide-react";
import { cn } from "../lib/utils";

interface SkillGapAnalysisProps {
  cvData?: any | null;
  cvText?: string;
}

interface SkillInsight {
  id: string;
  type: "missing" | "weak" | "opportunity" | "achievement";
  title: string;
  description: string;
  actionLabel: string;
  actionLink?: string;
  percentage?: number;
  beforeAfter?: {
    before: string;
    after: string;
  };
  category: "technical" | "experience" | "certification" | "tool" | "achievement";
}

export default function SkillGapAnalysis({ cvData, cvText = "" }: SkillGapAnalysisProps) {
  const [insights, setInsights] = useState<SkillInsight[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    if (!cvData && !cvText) {
      setInsights([]);
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);
    
    if (cvData?.aiInsights) {
      setInsights(cvData.aiInsights);
      setIsAnalyzing(false);
    } else {
      // Practical fallback: derive insights from weaknesses/missing keywords so the widget is still useful.
      const weaknesses: string[] = Array.isArray(cvData?.weaknesses) ? cvData.weaknesses : [];
      const missingKeywords: string[] = Array.isArray(cvData?.missingKeywords) ? cvData.missingKeywords : [];

      const next: SkillInsight[] = [];

      for (const w of weaknesses.slice(0, 3)) {
        const wl = String(w).toLowerCase();
        if (wl.includes("matric") || wl.includes("grade 12")) {
          next.push({
            id: `w-${next.length}`,
            type: "missing",
            title: "Add Matric / Grade 12 details",
            description: "Many SA entry-level screens look for Matric/Grade 12. Add your school name, year, and key subjects.",
            actionLabel: "Update CV and re-run",
            actionLink: "/dashboard/cv-analyzer",
            category: "experience",
          });
          continue;
        }

        if (wl.includes("quantifiable") || wl.includes("metrics") || wl.includes("numbers")) {
          next.push({
            id: `w-${next.length}`,
            type: "weak",
            title: "Add measurable achievements",
            description: "Rewrite 2–3 bullets with numbers (e.g., customers/day, time saved, revenue, % improvement).",
            actionLabel: "Revamp CV",
            actionLink: "/dashboard/cv-analyzer",
            category: "achievement",
          });
          continue;
        }

        if (wl.includes("driver") || wl.includes("licence") || wl.includes("license")) {
          next.push({
            id: `w-${next.length}`,
            type: "missing",
            title: "Mention your driver's licence",
            description: "If you have one, add it clearly (e.g., “Driver’s Licence: Code B”). It improves ATS matching for many roles.",
            actionLabel: "Update CV and re-run",
            actionLink: "/dashboard/cv-analyzer",
            category: "experience",
          });
          continue;
        }

        next.push({
          id: `w-${next.length}`,
          type: "weak",
          title: "Improve a weak area",
          description: String(w),
          actionLabel: "Update CV and re-run",
          actionLink: "/dashboard/cv-analyzer",
          category: "experience",
        });
      }

      if (next.length < 4 && missingKeywords.length > 0) {
        next.push({
          id: `k-${next.length}`,
          type: "opportunity",
          title: "Add missing keywords",
          description: `Add these keywords naturally in your skills/experience: ${missingKeywords.slice(0, 6).join(", ")}.`,
          actionLabel: "Update CV and re-run",
          actionLink: "/dashboard/cv-analyzer",
          category: "technical",
        });
      }

      setInsights(next);
      setIsAnalyzing(false);
    }
  }, [cvData, cvText]);

  const iconMap = {
    missing: AlertTriangle,
    weak: Sparkles,
    opportunity: TrendingUp,
    achievement: Award
  };

  const categoryIconMap = {
    technical: Code,
    experience: Briefcase,
    certification: Shield,
    tool: TestTube,
    achievement: Award
  };

  const borderMap = {
    missing: "border-neon-orange/30",
    weak: "border-secondary/30",
    opportunity: "border-neon-green/30",
    achievement: "border-neon-green/30"
  };

  if (isAnalyzing) {
    return (
      <div className="glass-panel-strong p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative mb-4">
            <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Code className="h-6 w-6 sm:h-8 sm:w-8 text-primary animate-pulse" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/20"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <h4 className="text-sm font-display font-semibold mb-2">Analyzing Your Technical Profile</h4>
          <p className="text-xs text-muted-foreground mb-4">Identifying skill gaps and opportunities...</p>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-2 w-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Only show empty state if there are TRULY no insights AND we have data
  if (insights.length === 0 && cvData) {
    return (
      <div className="glass-panel-strong p-8 text-center">
        <div className="h-12 w-12 rounded-full bg-neon-green/10 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="h-6 w-6 text-neon-green" />
        </div>
        <h4 className="text-sm font-display font-semibold mb-1">Your Profile Looks Strong!</h4>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Your technical skills are well-rounded. Keep building projects and adding experience.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel-strong p-6 relative overflow-hidden">
      <div className="scanline absolute inset-0 pointer-events-none opacity-30" />
      <div className="relative">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-secondary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">AI-Generated Technical Insights</h3>
            <p className="text-xs text-muted-foreground">
              Personalized for your tech stack • {insights.length} opportunities found
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {insights.map((insight, i) => {
              const Icon = iconMap[insight.type];
              const CategoryIcon = categoryIconMap[insight.category];
              const isExpanded = expandedId === insight.id;

              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className={cn(
                    "rounded-xl border p-5 transition-all", 
                    borderMap[insight.type], 
                    "bg-card/40 hover:bg-card/60"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                        className="h-9 w-9 rounded-lg bg-card/80 border border-border/50 flex items-center justify-center flex-shrink-0"
                      >
                        <Icon className="h-4 w-4 text-primary" />
                      </motion.div>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-card border border-border flex items-center justify-center">
                        <CategoryIcon className="h-2.5 w-2.5 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                        <h4 className="text-sm font-semibold">{insight.title}</h4>
                        {insight.percentage && (
                          <span className="text-xs font-mono text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                            {insight.percentage}% relevance
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                        {insight.description}
                      </p>

                      {insight.beforeAfter && (
                        <div className="mb-3">
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : insight.id)}
                            className="text-xs font-medium text-secondary hover:text-secondary/80 transition-colors flex items-center gap-1 mb-2"
                          >
                            {isExpanded ? "Hide" : "Show"} Before / After Example
                            <ArrowRight className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-90")} />
                          </button>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-hidden"
                              >
                                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-destructive mb-1 block">
                                    Before
                                  </span>
                                  <p className="text-xs text-muted-foreground italic">
                                    {insight.beforeAfter.before}
                                  </p>
                                </div>
                                <div className="p-3 rounded-lg bg-neon-green/5 border border-neon-green/20">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-neon-green mb-1 block">
                                    After
                                  </span>
                                  <p className="text-xs text-foreground">
                                    {insight.beforeAfter.after}
                                  </p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      <a
                        href={insight.actionLink || "#"}
                        target={insight.actionLink ? "_blank" : undefined}
                        rel={insight.actionLink ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                        onClick={(e) => !insight.actionLink && e.preventDefault()}
                      >
                        <Plus className="h-3 w-3" /> 
                        {insight.actionLabel}
                      </a>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
