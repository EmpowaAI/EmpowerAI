// Digital Twin Builder — guided step-by-step career profile creator
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Bot, Briefcase, CheckCircle,
  FileText, Loader2, MapPin, Sparkles, Target, User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { twinAPI } from "../../lib/api";
import { useUser } from "../../contexts/user-context";
import { getStoredCvAnalysis } from "../../lib/sensitiveStorage";
import toast from "react-hot-toast";

// ── Types ──────────────────────────────────────────────────────────────────

interface TwinProfile {
  name: string;
  province: string;
  careerStage: string;
  skills: string[];
  experience: string;
  education: string;
  desiredRole: string;
  industries: string[];
  interests: string[];
  salaryGoal: string;
  workPreference: string;
}

interface SavedTwin {
  identity?: { currentRole?: string; targetRole?: string; industry?: string; seniorityLevel?: string };
  economy?: { employabilityScore?: number; marketValueScore?: number; demandLevel?: string; incomePotentialRange?: { min?: number; max?: number } };
  skills?: { core?: string; missing?: string; emerging?: string };
  intelligence?: { strengths?: string; recommendations?: string };
  status?: string;
}

// ── Step config ────────────────────────────────────────────────────────────

const STEPS = [
  { id: "identity", label: "Identity", icon: User },
  { id: "skills", label: "Skills", icon: Sparkles },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "goals", label: "Goals", icon: Target },
  { id: "summary", label: "Summary", icon: Bot },
] as const;

type StepId = typeof STEPS[number]["id"];

const PROGRESS_MAP: Record<StepId, number> = {
  identity: 20,
  skills: 40,
  experience: 60,
  goals: 80,
  summary: 100,
};

// ── Suggested data ─────────────────────────────────────────────────────────

const SUGGESTED_SKILLS = [
  "Communication", "Excel", "Customer Service", "Data Analysis", "Sales",
  "Marketing", "Project Management", "Problem Solving", "Leadership",
  "Python", "Design", "Administration", "Research", "Writing",
  "Social Media", "JavaScript", "SQL", "Teamwork", "Presentation",
];

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "Education",
  "Retail", "Creative", "Government", "Entrepreneurship",
  "Engineering", "Media", "Logistics",
];

const CAREER_STAGES = ["Student", "Graduate", "Entry level", "Experienced", "Career switcher"];
const WORK_PREFS = ["Remote", "Hybrid", "On-site", "Any"];
const SA_PROVINCES = [
  "Gauteng", "Western Cape", "KwaZulu-Natal", "Eastern Cape",
  "Limpopo", "Mpumalanga", "North West", "Free State", "Northern Cape",
];

// ── Helper: parse comma-separated string to array ──────────────────────────

function parseToArray(str?: string): string[] {
  if (!str) return [];
  return str.split(",").map(s => s.trim()).filter(Boolean);
}

// ── Main component ─────────────────────────────────────────────────────────

export default function TwinBuilder() {
  const navigate = useNavigate();
  const { user, updateProgress } = useUser();

  const [activeStep, setActiveStep] = useState<StepId>("identity");
  const [submitting, setSubmitting] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [savedTwin, setSavedTwin] = useState<SavedTwin | null>(null);
  const [hasCvProfile, setHasCvProfile] = useState(false);
  const [twinProfile, setTwinProfile] = useState<TwinProfile>({
    name: user?.name ?? "",
    province: user?.province ?? "",
    careerStage: "",
    skills: [],
    experience: "",
    education: "",
    desiredRole: "",
    industries: [],
    interests: [],
    salaryGoal: "",
    workPreference: "",
  });

  const progress = PROGRESS_MAP[activeStep];
  const currentIndex = STEPS.findIndex(s => s.id === activeStep);

  // ── Initialise: pre-fill from CV + check for existing twin ──────────────

  useEffect(() => {
    const init = async () => {
      setLoadingExisting(true);

      // Pre-fill from stored CV analysis
      const cvAnalysis = getStoredCvAnalysis<any>();
      if (cvAnalysis) {
        setHasCvProfile(true);
        setTwinProfile(prev => ({
          ...prev,
          name: prev.name || user?.name || "",
          skills: cvAnalysis.sections?.skills?.slice(0, 8) ?? prev.skills,
          experience: Array.isArray(cvAnalysis.sections?.experience)
            ? cvAnalysis.sections.experience.slice(0, 3).join("\n")
            : prev.experience,
          education: Array.isArray(cvAnalysis.sections?.education)
            ? cvAnalysis.sections.education.slice(0, 2).join(", ")
            : prev.education,
        }));
      }

      // Try to load existing twin
      try {
        const res = await twinAPI.get();
        const twin = res?.data?.twin;
        if (twin) {
          setSavedTwin(twin);
          setActiveStep("summary");
        }
      } catch {
        // No twin yet — that's fine
      } finally {
        setLoadingExisting(false);
      }
    };

    void init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (field: keyof TwinProfile, value: string | string[]) =>
    setTwinProfile(prev => ({ ...prev, [field]: value }));

  const toggleArrayItem = (field: "skills" | "industries" | "interests", item: string) => {
    setTwinProfile(prev => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item],
      };
    });
  };

  const goNext = () => {
    const next = STEPS[currentIndex + 1];
    if (next) setActiveStep(next.id);
  };

  const goPrev = () => {
    const prev = STEPS[currentIndex - 1];
    if (prev) setActiveStep(prev.id);
  };

  const handleBuild = async () => {
    if (!hasCvProfile) {
      toast.error("Please complete your CV analysis first before building your Twin.");
      void navigate("/dashboard/cv-analyzer");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: twinProfile.name || user?.name || "",
        province: twinProfile.province,
        interests: [
          ...twinProfile.interests,
          ...twinProfile.industries,
          twinProfile.desiredRole,
        ].filter(Boolean),
        age: 25,
      };

      const res = await twinAPI.create(payload);
      const twin = res?.data?.twin;

      if (twin) {
        setSavedTwin(twin);

        localStorage.setItem("twinData", JSON.stringify(twin));
        localStorage.setItem("twinCreated", "true");
        localStorage.setItem("twinCompleted", "true");
        if (twin.economy?.employabilityScore) {
          localStorage.setItem("empowermentScore", String(twin.economy.employabilityScore));
        }
        updateProgress("twinCompleted", true);
        window.dispatchEvent(new Event("twinCompleted"));

        toast.success("Your AI Twin has been built!");
        setActiveStep("summary");
      }
    } catch (err: any) {
      const msg = err?.message ?? "Failed to build twin. Please try again.";
      toast.error(msg as string);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────

  if (loadingExisting) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Loading your twin profile…</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <section className="border-b bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <span className="mb-3 inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            AI Twin Builder
          </span>
          <h1 className="text-3xl font-bold md:text-4xl">Build your AI career twin</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Create a personal career model that helps EmpowerAI understand your skills, goals, and opportunities.
          </p>
          {!hasCvProfile && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
              <FileText className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="text-amber-700 dark:text-amber-400">
                Your Twin is powered by your CV data.{" "}
                <Link to="/dashboard/cv-analyzer" className="font-semibold underline">Analyse your CV first</Link>
                {" "}for the best results.
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-6">

        {/* Step progress */}
        <div className="rounded-xl border bg-card/60 p-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Twin creation progress</span>
            <span className="font-semibold text-primary">{progress}% complete</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {STEPS.map(step => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              const isDone = PROGRESS_MAP[step.id] < PROGRESS_MAP[activeStep];
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "border-primary bg-primary/10 text-primary font-semibold"
                      : isDone
                        ? "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400"
                        : "border-border bg-background text-muted-foreground hover:border-primary/40"
                  )}
                >
                  {isDone ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  {step.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main layout: step content + preview */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">

          {/* ── Step content ──────────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Step 1: Identity */}
            {activeStep === "identity" && (
              <Card>
                <CardHeader>
                  <CardTitle>Start with your basics</CardTitle>
                  <CardDescription>This helps your Twin understand your current career position.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Your name</Label>
                    <Input
                      id="name"
                      value={twinProfile.name}
                      onChange={e => update("name", e.target.value)}
                      placeholder="e.g. Thando"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Province</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {SA_PROVINCES.map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => update("province", twinProfile.province === p ? "" : p)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-sm transition-colors",
                            twinProfile.province === p
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background hover:border-primary/50"
                          )}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Career stage</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {CAREER_STAGES.map(stage => (
                        <button
                          key={stage}
                          type="button"
                          onClick={() => update("careerStage", twinProfile.careerStage === stage ? "" : stage)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-sm transition-colors",
                            twinProfile.careerStage === stage
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background hover:border-primary/50"
                          )}
                        >
                          {stage}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Skills */}
            {activeStep === "skills" && (
              <Card>
                <CardHeader>
                  <CardTitle>Map your skills</CardTitle>
                  <CardDescription>
                    {hasCvProfile
                      ? "Skills detected from your CV are pre-selected. Add or remove as needed."
                      : "Select the skills that best describe you."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasCvProfile && twinProfile.skills.length > 0 && (
                    <p className="rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-xs text-primary">
                      {twinProfile.skills.length} skills detected from your CV analysis
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_SKILLS.map(skill => {
                      const selected = twinProfile.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleArrayItem("skills", skill)}
                          className={cn(
                            "rounded-full border px-4 py-1.5 text-sm transition-colors",
                            selected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-background hover:border-primary/50"
                          )}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {twinProfile.skills.length} skill{twinProfile.skills.length !== 1 ? "s" : ""} selected
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Experience */}
            {activeStep === "experience" && (
              <Card>
                <CardHeader>
                  <CardTitle>Add your experience</CardTitle>
                  <CardDescription>
                    Include work, school, projects, volunteering, or anything that shows your ability.
                    {hasCvProfile && " Pre-filled from your CV — edit as needed."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="experience">Experience summary</Label>
                    <Textarea
                      id="experience"
                      value={twinProfile.experience}
                      onChange={e => update("experience", e.target.value)}
                      placeholder="Tell us about your work, internships, volunteering, or projects."
                      className="mt-1 min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="education">Education</Label>
                    <Textarea
                      id="education"
                      value={twinProfile.education}
                      onChange={e => update("education", e.target.value)}
                      placeholder="Your school, college, university, certificates, or training."
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Goals */}
            {activeStep === "goals" && (
              <Card>
                <CardHeader>
                  <CardTitle>Set your career direction</CardTitle>
                  <CardDescription>Your Twin uses this to suggest better career moves.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="desiredRole">Desired role</Label>
                    <Input
                      id="desiredRole"
                      value={twinProfile.desiredRole}
                      onChange={e => update("desiredRole", e.target.value)}
                      placeholder="e.g. Data Analyst, Software Developer, HR Assistant"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Preferred industries</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {INDUSTRIES.map(industry => {
                        const selected = twinProfile.industries.includes(industry);
                        return (
                          <button
                            key={industry}
                            type="button"
                            onClick={() => toggleArrayItem("industries", industry)}
                            className={cn(
                              "rounded-full border px-4 py-1.5 text-sm transition-colors",
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background hover:border-primary/50"
                            )}
                          >
                            {industry}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="salaryGoal">Salary goal</Label>
                      <Input
                        id="salaryGoal"
                        value={twinProfile.salaryGoal}
                        onChange={e => update("salaryGoal", e.target.value)}
                        placeholder="e.g. R18,000/month"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Work preference</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {WORK_PREFS.map(pref => (
                          <button
                            key={pref}
                            type="button"
                            onClick={() => update("workPreference", twinProfile.workPreference === pref ? "" : pref)}
                            className={cn(
                              "rounded-full border px-3 py-1.5 text-sm transition-colors",
                              twinProfile.workPreference === pref
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border bg-background hover:border-primary/50"
                            )}
                          >
                            {pref}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 5: Summary */}
            {activeStep === "summary" && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {savedTwin ? "Your AI Twin is active" : "Your AI Twin is taking shape"}
                  </CardTitle>
                  <CardDescription>
                    {savedTwin
                      ? "Here is what EmpowerAI understands about your career profile."
                      : "Review your details and build your twin."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">

                  {savedTwin ? (
                    <>
                      {/* Readiness bar */}
                      <div className="rounded-lg border bg-muted/40 p-4">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-semibold">Twin readiness</span>
                          <span className="font-semibold text-primary">
                            {savedTwin.economy?.employabilityScore ?? 100}%
                          </span>
                        </div>
                        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${savedTwin.economy?.employabilityScore ?? 100}%` }}
                          />
                        </div>
                        {savedTwin.economy?.demandLevel && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Market demand: <span className="font-medium text-foreground">{savedTwin.economy.demandLevel}</span>
                          </p>
                        )}
                      </div>

                      {/* Insight cards */}
                      <div className="grid gap-3 sm:grid-cols-3">
                        {[
                          {
                            icon: Sparkles,
                            title: "Strongest signal",
                            value: parseToArray(savedTwin.skills?.core)[0] || twinProfile.skills[0] || "Add more skills",
                          },
                          {
                            icon: Target,
                            title: "Career direction",
                            value: savedTwin.identity?.targetRole || twinProfile.desiredRole || "Not selected",
                          },
                          {
                            icon: MapPin,
                            title: "Market location",
                            value: twinProfile.province || user?.province || "Not added",
                          },
                        ].map(card => {
                          const Icon = card.icon;
                          return (
                            <div key={card.title} className="rounded-lg border bg-card p-4">
                              <Icon className="mb-2 h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">{card.title}</p>
                              <p className="mt-0.5 text-sm font-semibold">{card.value}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Income range */}
                      {savedTwin.economy?.incomePotentialRange?.min != null && (
                        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                          <p className="mb-1 text-xs text-muted-foreground">Income potential range</p>
                          <p className="font-bold text-green-700 dark:text-green-400">
                            R{savedTwin.economy.incomePotentialRange.min.toLocaleString()}
                            {savedTwin.economy.incomePotentialRange.max != null && (
                              <> – R{savedTwin.economy.incomePotentialRange.max.toLocaleString()}</>
                            )}
                            /month
                          </p>
                        </div>
                      )}

                      {/* Recommendations */}
                      {savedTwin.intelligence?.recommendations && (
                        <div>
                          <p className="mb-2 text-sm font-semibold">Recommendations</p>
                          <ul className="space-y-1.5">
                            {parseToArray(savedTwin.intelligence.recommendations).slice(0, 4).map((rec, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Pre-build review */
                    <div className="space-y-2.5">
                      {[
                        { label: "Name", value: twinProfile.name || "Not set" },
                        { label: "Province", value: twinProfile.province || "Not set" },
                        { label: "Career stage", value: twinProfile.careerStage || "Not set" },
                        { label: "Skills", value: twinProfile.skills.length > 0 ? `${twinProfile.skills.length} selected` : "None selected" },
                        { label: "Desired role", value: twinProfile.desiredRole || "Not set" },
                        { label: "Industries", value: twinProfile.industries.length > 0 ? twinProfile.industries.join(", ") : "None selected" },
                      ].map(row => (
                        <div key={row.label} className="flex justify-between gap-4 border-b border-border/40 pb-2 text-sm">
                          <span className="text-muted-foreground">{row.label}</span>
                          <span className="font-medium text-right">{row.value}</span>
                        </div>
                      ))}

                      {!hasCvProfile && (
                        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-400">
                          No CV analysis found. Your Twin will have limited insights.{" "}
                          <Link to="/dashboard/cv-analyzer" className="font-semibold underline">Analyse your CV</Link> for best results.
                        </p>
                      )}
                    </div>
                  )}

                  {/* CTAs */}
                  <div className="flex flex-wrap gap-3 pt-1">
                    {savedTwin ? (
                      <>
                        <Button asChild>
                          <Link to="/dashboard/opportunities">
                            Explore my path <ArrowRight className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link to="/dashboard/cv-analyzer">Improve my CV</Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setSavedTwin(null); setActiveStep("identity"); }}>
                          Rebuild Twin
                        </Button>
                      </>
                    ) : (
                      <Button onClick={handleBuild} disabled={submitting || !hasCvProfile} className="min-w-[160px]">
                        {submitting ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Building…</>
                        ) : (
                          <><Bot className="h-4 w-4" /> Build my Twin</>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            {activeStep !== "summary" && (
              <div className="flex items-center justify-between pt-1">
                <Button variant="outline" onClick={goPrev} disabled={currentIndex === 0}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
                <Button onClick={activeStep === "goals" ? () => setActiveStep("summary") : goNext}>
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* ── Live Twin preview (sticky sidebar) ────────────────────── */}
          <aside>
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Your Twin Preview</CardTitle>
                <CardDescription className="text-xs">Updates as you add information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">

                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-semibold">{twinProfile.name || "Your AI Twin"}</p>
                    <p className="text-xs text-muted-foreground">
                      {twinProfile.desiredRole || "Career path not selected yet"}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="text-muted-foreground">Readiness</span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { label: "Province", value: twinProfile.province || "Not added" },
                    { label: "Career stage", value: twinProfile.careerStage || "Not selected" },
                    { label: "Skills", value: twinProfile.skills.length > 0 ? `${twinProfile.skills.length} selected` : "None yet" },
                    { label: "Industries", value: twinProfile.industries.length > 0 ? `${twinProfile.industries.length} selected` : "None yet" },
                    { label: "CV data", value: hasCvProfile ? "Loaded ✓" : "Not analysed yet" },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between gap-3 border-b border-border/30 pb-2 text-xs">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className={cn("font-medium text-right", row.label === "CV data" && hasCvProfile ? "text-green-600 dark:text-green-400" : "")}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                {!hasCvProfile && (
                  <Link to="/dashboard/cv-analyzer">
                    <Button variant="outline" size="sm" className="mt-1 w-full">
                      <FileText className="h-4 w-4" /> Analyse CV first
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </div>
  );
}
