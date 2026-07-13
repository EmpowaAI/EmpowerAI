import { type FormEvent, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import {
  Bot,
  BriefcaseBusiness,
  ChevronDown,
  CircleDollarSign,
  Lightbulb,
  Loader2,
  Send,
  Sparkles,
  Target,
  UserRound,
  Zap,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Mic,
} from "lucide-react";
import { twinAPI, twinAPIReal, cvAPI } from "../../lib/api";
import { useUser } from "../../contexts/user-context";
import { getStoredCvAnalysis } from "../../lib/sensitiveStorage";

// ── Types ──────────────────────────────────────────────────────────────

interface TwinProfile {
  name: string;
  path: string;
  industry: string;
  level: string;
  value: string;
  skills: string[];
  empowermentScore?: number;
  marketDemand?: string;
}

interface TwinData {
  profile?: TwinProfile;
  skills?: string[];
  careerPaths?: { title: string; match?: number }[];
  gaps?: string[];
  recommendations?: string[];
  mappedJobs?: string[];
  nextSteps?: string[];
  empowermentScore?: number;
  economy?: { employabilityScore?: number; incomeRange?: string };
  name?: string;
  industry?: string;
  level?: string;
  dataSource?: 'ai' | 'chat' | 'fallback' | string;
}

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  options?: string[];
  isCompletion?: boolean;
};

// After this many user turns the chat wraps up automatically.
// Users can also finish early by selecting the "Finish" quick option.
const MAX_TURNS = 5;

const FINISH_SIGNAL = "Finish - show me my results →";

const DEFAULT_QUICK_QUESTIONS = [
  "What skills am I missing?",
  "What's my market demand?",
  "Give me career recommendations",
  "What can I monetize?",
];

const MID_QUICK_QUESTIONS = [
  "What jobs match my profile?",
  "How do I increase my salary?",
];

// ── Insight card component ──────────────────────────────────────────────

const InsightCard = ({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Lightbulb;
  title: string;
  children: ReactNode;
}) => (
  <article className="rounded-xl border border-border bg-card">
    <button type="button" className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left">
      <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
        <Icon className="h-4 w-4" />
        {title}
      </span>
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    </button>
    <div className="border-t border-border px-4 py-4">{children}</div>
  </article>
);

// Treat JS "undefined"/"null" strings and empty strings as missing.
function safeStr(val: unknown, fallback = ""): string {
  if (val == null) return fallback;
  const s = String(val).trim();
  if (!s || s.toLowerCase() === "undefined" || s.toLowerCase() === "null" || s.toLowerCase() === "n/a") return fallback;
  return s;
}

// Map the backend's nested twin shape to the flat TwinData interface the UI expects.
function normalizeTwin(raw: any): TwinData | null {
  if (!raw) return null;
  const isNested = (raw.identity || raw.economy) && !Array.isArray(raw.skills);
  if (!isNested) return raw as TwinData;

  const employabilityScore: number = raw.economy?.employabilityScore ?? 0;
  const incomeRange = raw.economy?.incomePotentialRange
    ? `R${(raw.economy.incomePotentialRange.min ?? 0).toLocaleString()} – R${(raw.economy.incomePotentialRange.max ?? 0).toLocaleString()}/month`
    : undefined;
  const coreSkills: string[] = Array.isArray(raw.skills?.core) ? raw.skills.core : [];
  const industry: string = safeStr(raw.identity?.industry, "General");
  const demandRaw: string = raw.economy?.demandLevel ?? "";
  const marketDemand = demandRaw
    ? demandRaw.charAt(0) + demandRaw.slice(1).toLowerCase()
    : employabilityScore > 70 ? "High" : employabilityScore > 40 ? "Medium" : "Developing";

  const currentRole = safeStr(raw.identity?.currentRole);
  const targetRole = safeStr(raw.identity?.targetRole);

  return {
    profile: {
      name: currentRole || "Economic Twin Profile",
      path: targetRole || "Career profile",
      industry,
      level: safeStr(raw.identity?.seniorityLevel),
      value: incomeRange || "-",
      skills: coreSkills,
      empowermentScore: employabilityScore,
      marketDemand,
    },
    skills: coreSkills,
    gaps: Array.isArray(raw.skills?.missing) ? raw.skills.missing : [],
    recommendations: Array.isArray(raw.intelligence?.recommendations) ? raw.intelligence.recommendations : [],
    mappedJobs: Array.isArray(raw.market?.jobTitlesMapped) ? raw.market.jobTitlesMapped : [],
    careerPaths: Array.isArray(raw.market?.jobTitlesMapped)
      ? raw.market.jobTitlesMapped.map((title: string) => ({ title }))
      : [],
    empowermentScore: employabilityScore,
    economy: { employabilityScore, incomeRange },
    name: currentRole || undefined,
    industry,
    level: safeStr(raw.identity?.seniorityLevel) || undefined,
  };
}

// ── Completion card rendered inline in the chat ─────────────────────────

const CompletionCard = ({
  score,
  skills,
  onOpportunities,
  onInterview,
}: {
  score: number;
  skills: string[];
  onOpportunities: () => void;
  onInterview: () => void;
}) => (
  <div className="mt-4 rounded-xl border border-border overflow-hidden">
    {/* Gradient header */}
    <div className="relative overflow-hidden px-4 py-4 text-white" style={{ background: 'var(--gradient-hero)' }}>
      <div className="pointer-events-none absolute inset-0 ubuntu-pattern opacity-20" aria-hidden />
      <div className="relative z-10 flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5 shrink-0" />
        <p className="font-display font-bold text-sm">Your Economic Twin is ready!</p>
      </div>
    </div>

    <div className="bg-card p-4 space-y-4">
      {score > 0 && (
        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-muted-foreground font-medium">Empowerment Score</span>
            <span className="font-bold text-primary">{score}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${score}%`, background: 'var(--gradient-hero)' }} />
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, 5).map((s) => (
            <span key={s} className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
              {s}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">Your profile is built. Choose what to do next:</p>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onOpportunities}
          className="shimmer flex flex-col items-center gap-2 rounded-xl px-4 py-4 text-white transition-all hover:-translate-y-0.5"
          style={{ background: 'var(--gradient-hero)' }}
        >
          <Briefcase className="h-5 w-5" />
          <span className="text-sm font-bold leading-tight text-center">Browse Opportunities</span>
        </button>
        <button
          type="button"
          onClick={onInterview}
          className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-4 py-4 text-foreground transition-colors hover:border-primary/40 hover:bg-muted/30"
        >
          <Mic className="h-5 w-5 text-secondary" />
          <span className="text-sm font-bold leading-tight text-center">Practice Interview</span>
        </button>
      </div>
    </div>
  </div>
);

// ── Component ──────────────────────────────────────────────────────────

const TwinBuilder = () => {
  const { progress, updateProgress } = useUser();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isLoadingTwin, setIsLoadingTwin] = useState(true);
  const [isRebuildingTwin, setIsRebuildingTwin] = useState(false);
  const [twinData, setTwinData] = useState<TwinData | null>(null);
  const [twinError, setTwinError] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [chatComplete, setChatComplete] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const rawTwinRef = useRef<any>(null);
  const turnCountRef = useRef(0);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "Loading your Economic Twin data...",
      options: [],
    },
  ]);

  const applyTwin = (raw: any) => {
    const twin = normalizeTwin(raw);
    if (!twin) return false;
    setTwinData(twin);
    rawTwinRef.current = raw;
    const skills = twin.profile?.skills ?? twin.skills ?? [];
    const industry = twin.profile?.industry ?? twin.industry ?? "General";
    localStorage.setItem("twinData", JSON.stringify(raw));
    setChatMessages([{
      id: 1,
      role: "assistant",
      text: `Your Economic Twin is loaded. I can see your ${skills.length > 0 ? `${skills.length} core skills` : "profile"}, your industry (${industry}), and your full career profile.\n\nAsk me anything - salary benchmarks, skill gaps, market demand, career paths, or what to focus on next. When you're ready, select **Finish** to see your matched opportunities.`,
      options: [...DEFAULT_QUICK_QUESTIONS, FINISH_SIGNAL],
    }]);
    return true;
  };

  const loadTwinData = useCallback(async () => {
    setIsLoadingTwin(true);
    setTwinError("");

    try {
      // Always fetch from the API first - localStorage may be stale from a
      // previous CV upload (e.g. retail twin cached while user re-uploaded SE CV).
      const response = await twinAPI.get();
      const apiTwin = response?.data?.twin ?? null;

      if (apiTwin) {
        applyTwin(apiTwin);
        return;
      }

      const cvDone = localStorage.getItem("cvCompleted") === "true";
      if (cvDone) {
        setChatMessages([{
          id: 1, role: "assistant",
          text: "Building your Economic Twin from your CV analysis - this takes a moment...",
          options: [],
        }]);
        try {
          const buildResp = await twinAPI.buildFromCv();
          const builtTwin = buildResp?.data?.twin ?? null;
          if (builtTwin && applyTwin(builtTwin)) {
            localStorage.setItem("twinCompleted", "true");
            return;
          }
          const retryResponse = await twinAPI.get();
          const fetchedTwin = retryResponse?.data?.twin ?? null;
          if (fetchedTwin && applyTwin(fetchedTwin)) {
            localStorage.setItem("twinCompleted", "true");
            return;
          }
        } catch (buildErr: any) {
          const status = buildErr?.status ?? buildErr?.response?.status;
          if (status === 404) {
            const cachedAnalysis = getStoredCvAnalysis<Record<string, unknown>>();
            if (cachedAnalysis) {
              try {
                await cvAPI.restoreFromCache(cachedAnalysis);
                const retryBuild = await twinAPI.buildFromCv();
                const restoredTwin = retryBuild?.data?.twin ?? null;
                if (restoredTwin && applyTwin(restoredTwin)) {
                  localStorage.setItem("twinCompleted", "true");
                  updateProgress("twinCompleted", true);
                  return;
                }
              } catch {
                // fall through
              }
            }
            localStorage.removeItem("cvCompleted");
            localStorage.removeItem("twinCompleted");
            localStorage.removeItem("twinData");
            localStorage.removeItem("cvAnalysisData");
            updateProgress("cvCompleted", false);
            updateProgress("twinCompleted", false);
            navigate("/dashboard/cv-analyzer");
            return;
          }
        }
      }

      setTwinError(cvDone
        ? "Your twin could not be built right now. Please try again in a moment."
        : "No twin data found. Please complete the CV analysis first."
      );
      setChatMessages([{
        id: 1,
        role: "assistant",
        text: cvDone
          ? "I had trouble building your Economic Twin. Please try refreshing the page."
          : "I couldn't find your Economic Twin data. Please upload and analyze your CV first to build your twin.",
        options: [],
      }]);
    } catch {
      setTwinError("Failed to load twin data. Please try again.");
      setChatMessages([{
        id: 1,
        role: "assistant",
        text: "There was an issue loading your Economic Twin. Please check your connection and try again.",
        options: [],
      }]);
    } finally {
      setIsLoadingTwin(false);
    }
  }, [navigate, updateProgress]);

  useEffect(() => {
    void loadTwinData();
  }, [loadTwinData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatMessages, isBotTyping]);

  const rebuildTwinFromCv = async () => {
    setIsRebuildingTwin(true);
    setTwinError("");
    try {
      const buildResp = await twinAPI.buildFromCv();
      const builtTwin = buildResp?.data?.twin ?? null;
      if (builtTwin && applyTwin(builtTwin)) {
        localStorage.setItem("twinCompleted", "true");
        updateProgress("twinCompleted", true);
      } else {
        setTwinError("Rebuild completed but no twin data was returned. Please try again.");
      }
    } catch {
      setTwinError("Could not rebuild twin from CV. Please re-analyze your CV first.");
    } finally {
      setIsRebuildingTwin(false);
    }
  };

  const sendTwinMessage = async (prompt: string) => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || isBotTyping || chatComplete) return;

    // Treat the finish signal as a "wrap up" request
    const isFinishSignal = cleanPrompt === FINISH_SIGNAL;

    turnCountRef.current += 1;
    const isLast = isFinishSignal || turnCountRef.current >= MAX_TURNS;

    const displayPrompt = isFinishSignal ? "Show me my final results and next steps." : cleanPrompt;

    const userMsg: ChatMessage = { id: Date.now(), role: "user", text: displayPrompt };
    setChatMessages((current) => [...current, userMsg]);
    setIsBotTyping(true);

    const newHistory = [...chatHistory, { role: "user", content: displayPrompt }];
    setChatHistory(newHistory);

    try {
      const response = await twinAPIReal.chatMessage(
        isFinishSignal
          ? "Please give me a final summary of my profile: my top skills, the best job matches for me, and my top 3 next steps to land a job."
          : cleanPrompt,
        newHistory,
        rawTwinRef.current ?? twinData ?? {},
        isLast
      );

      const replyText: string =
        response?.data?.reply ??
        response?.reply ??
        response?.data?.message ??
        "I couldn't process your request right now. Please try again.";

      // Pick quick options based on how far through the conversation we are
      let nextOptions: string[];
      if (isLast) {
        nextOptions = [];
      } else if (turnCountRef.current >= 3) {
        nextOptions = [...MID_QUICK_QUESTIONS, FINISH_SIGNAL];
      } else {
        nextOptions = [...DEFAULT_QUICK_QUESTIONS, FINISH_SIGNAL];
      }

      const assistantMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: replyText,
        options: nextOptions,
        isCompletion: isLast,
      };

      setChatMessages((current) => [...current, assistantMsg]);
      setChatHistory((h) => [...h, { role: "assistant", content: replyText }]);

      if (isLast) {
        setChatComplete(true);
        localStorage.setItem("twinCompleted", "true");
        updateProgress("twinCompleted", true);
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: "I had trouble connecting. Please check your internet connection and try again.",
        options: isLast ? [] : [...DEFAULT_QUICK_QUESTIONS, FINISH_SIGNAL],
      };
      setChatMessages((current) => [...current, fallbackMsg]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const submitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;
    void sendTwinMessage(message);
    setMessage("");
  };

  // Derived display values - safeStr guards against stored "undefined"/"null" strings
  const profile = twinData?.profile;
  const displayName = safeStr(profile?.name ?? twinData?.name, "Economic Twin Profile");
  const displayPath = safeStr(profile?.path ?? twinData?.careerPaths?.[0]?.title, "Career profile");
  const displayIndustry = safeStr(profile?.industry ?? twinData?.industry, "General");
  const displayValue = profile?.value ?? twinData?.economy?.incomeRange ?? "-";
  const displayScore = profile?.empowermentScore ?? twinData?.empowermentScore ?? twinData?.economy?.employabilityScore ?? 0;
  const displayMarket = profile?.marketDemand ?? (displayScore > 70 ? "High" : displayScore > 40 ? "Medium" : "Developing");
  const skills: string[] = profile?.skills ?? twinData?.skills ?? [];
  const gaps: string[] = twinData?.gaps ?? [];
  const recommendations: string[] = twinData?.recommendations ?? [];
  const mappedJobs: string[] = twinData?.mappedJobs ?? (twinData?.careerPaths?.map((p) => p.title) ?? []);
  const nextSteps: string[] = twinData?.nextSteps ?? [
    "Chat with your twin above to explore career paths, salary projections, and skill recommendations.",
    "Run simulations to see how different choices affect your income and employability over time.",
    "Browse job opportunities matched to your profile and skills.",
  ];

  return (
    <main className="bg-background font-sans text-foreground">
      <div className="mx-auto grid max-w-[1070px] border-border bg-background lg:border-x lg:grid-cols-[390px_minmax(0,1fr)]">

        {/* ── Sidebar ── */}
        <aside className="order-2 overflow-y-auto border-t border-border bg-background px-4 py-4 lg:order-1 lg:h-screen lg:border-r lg:border-t-0">
          {isLoadingTwin ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading your Economic Twin…</p>
            </div>
          ) : twinError && !twinData ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-destructive mb-3" />
              <p className="text-sm font-semibold text-foreground mb-1">Twin not found</p>
              <p className="text-xs text-muted-foreground mb-4">{twinError}</p>
              <Link to="/dashboard/cv-analyzer">
                <Button className="w-full">
                  Analyze CV first
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Profile */}
              <section className="rounded-xl border border-border bg-card p-4">
                {/* Stale-data warning: few skills OR fallback source means twin wasn't built from real AI analysis */}
                {(skills.length <= 2 || twinData?.dataSource === 'fallback') && (
                  <div className="mb-3 flex items-start gap-2 rounded-lg border border-secondary/30 bg-secondary/5 px-3 py-2">
                    <AlertCircle className="h-4 w-4 text-secondary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      This twin was built with limited data.{" "}
                      <Link to="/dashboard/cv-analyzer" className="font-semibold text-secondary hover:underline">
                        Re-analyse your CV
                      </Link>{" "}
                      for accurate results.
                    </p>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Profile</p>
                    <h1 className="mt-1 text-lg font-bold leading-tight text-primary">{displayName}</h1>
                    <p className="mt-1 text-sm font-semibold leading-5 text-foreground">{displayPath}</p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-muted/60 p-3">
                    <BriefcaseBusiness className="h-4 w-4 text-primary" />
                    <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Industry</p>
                    <p className="font-semibold text-foreground">{displayIndustry}</p>
                  </div>
                  <div className="rounded-lg bg-muted/60 p-3">
                    <CircleDollarSign className="h-4 w-4 text-secondary" />
                    <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Market</p>
                    <p className="font-semibold text-foreground">{displayMarket}</p>
                  </div>
                </div>

                {displayValue !== "-" && (
                  <div className="mt-4 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm font-semibold text-foreground">
                    Income potential · {displayValue}
                  </div>
                )}

                {displayScore > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground font-medium">Empowerment Score</span>
                      <span className="font-bold text-primary">{displayScore}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-secondary transition-[width] duration-700" style={{ width: `${displayScore}%` }} />
                    </div>
                  </div>
                )}
              </section>

              {/* Next actions - always visible once twin is loaded */}
              {twinData && (
                <section className="rounded-xl border border-border overflow-hidden">
                  <div className="relative overflow-hidden px-3 py-2.5 text-white" style={{ background: 'var(--gradient-hero)' }}>
                    <div className="pointer-events-none absolute inset-0 ubuntu-pattern opacity-15" aria-hidden />
                    <p className="relative z-10 text-xs font-bold uppercase tracking-wider">Ready to act?</p>
                  </div>
                  <div className="bg-card p-3 space-y-2">
                    <Link to="/dashboard/opportunities">
                      <Button className="w-full mb-1 shimmer" style={{ background: 'var(--gradient-hero)', color: 'white', border: 'none' }}>
                        <Briefcase className="mr-2 h-4 w-4" />
                        Browse Opportunities
                      </Button>
                    </Link>
                    <Link to="/dashboard/interview-coach">
                      <Button variant="outline" className="w-full">
                        <Mic className="mr-2 h-4 w-4" />
                        Practice Interview
                      </Button>
                    </Link>
                  </div>
                </section>
              )}

              {/* Rebuild from CV */}
              {twinData && (
                <button
                  type="button"
                  onClick={() => void rebuildTwinFromCv()}
                  disabled={isRebuildingTwin}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-50"
                >
                  {isRebuildingTwin ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Zap className="h-3.5 w-3.5" />
                  )}
                  {isRebuildingTwin ? "Rebuilding twin…" : "Rebuild from latest CV"}
                </button>
              )}

              {/* Core Skills */}
              {skills.length > 0 && (
                <InsightCard icon={Sparkles} title={`Core skills · ${displayIndustry.toLowerCase()} · v1`}>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                        {skill}
                      </span>
                    ))}
                  </div>
                </InsightCard>
              )}

              {/* Gaps */}
              {gaps.length > 0 && (
                <InsightCard icon={Lightbulb} title="Potential gaps">
                  <ul className="space-y-2.5">
                    {gaps.map((gap) => (
                      <li key={gap} className="flex gap-2 text-sm font-medium leading-5 text-foreground">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                        <span>{gap}</span>
                      </li>
                    ))}
                  </ul>
                </InsightCard>
              )}

              {/* Recommendations */}
              {recommendations.length > 0 && (
                <InsightCard icon={Lightbulb} title="Recommendations">
                  <ol className="space-y-3">
                    {recommendations.map((item, index) => (
                      <li key={item} className="flex gap-3 text-sm font-medium leading-5 text-foreground">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-primary">
                          {index + 1}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </InsightCard>
              )}

              {/* Mapped Jobs */}
              {mappedJobs.length > 0 && (
                <InsightCard icon={Target} title="Mapped job titles">
                  <div className="flex flex-wrap gap-2">
                    {mappedJobs.map((job) => (
                      <span key={job} className="rounded-md border border-border bg-muted/60 px-2.5 py-1 text-xs font-semibold text-foreground">
                        {job}
                      </span>
                    ))}
                  </div>
                </InsightCard>
              )}

              {/* Next Steps */}
              <InsightCard icon={Zap} title="Next steps">
                <ol className="space-y-3">
                  {nextSteps.map((step, index) => (
                    <li key={index} className="flex gap-3 text-sm font-medium leading-5 text-foreground">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </InsightCard>

              {!progress.cvCompleted && (
                <section className="rounded-xl border border-primary bg-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-primary" />
                    <h3 className="font-bold text-primary">Start Here</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Your strongest next move is to improve your CV evidence before applying widely.
                  </p>
                  <Link to="/dashboard/cv-analyzer">
                    <Button className="w-full">
                      Open CV Analyzer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </section>
              )}
            </div>
          )}
        </aside>

        {/* ── Chat Panel ── */}
        <section className="order-1 flex flex-col bg-background lg:order-2 lg:h-screen lg:min-h-0">
          <div className="min-h-[50vh] px-4 pb-4 pt-6 sm:px-5 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:pb-8 lg:pt-12">
            <div className="space-y-5">
              {chatMessages.map((chat) => (
                <div key={chat.id} className={`flex gap-3 ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
                  {chat.role === "assistant" && (
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div className="max-w-[496px]">
                    <div
                      className={`px-4 py-3 text-sm font-medium leading-6 shadow-sm ${
                        chat.role === "user"
                          ? "rounded-2xl bg-primary text-primary-foreground font-bold"
                          : "rounded-[14px] border border-border bg-card text-foreground"
                      }`}
                    >
                      {chat.role === "assistant" ? (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                            em: ({ children }) => <em className="italic">{children}</em>,
                            h1: ({ children }) => <p className="font-bold text-base mb-1">{children}</p>,
                            h2: ({ children }) => <p className="font-bold mb-1">{children}</p>,
                            h3: ({ children }) => <p className="font-semibold mb-1">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="leading-5">{children}</li>,
                            hr: () => <hr className="my-2 border-border" />,
                            code: ({ children }) => <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">{children}</code>,
                          }}
                        >
                          {chat.text}
                        </ReactMarkdown>
                      ) : (
                        chat.text
                      )}
                    </div>

                    {/* Completion card shown after final assistant message */}
                    {chat.role === "assistant" && chat.isCompletion && (
                      <CompletionCard
                        score={displayScore}
                        skills={skills}
                        onOpportunities={() => navigate("/dashboard/opportunities")}
                        onInterview={() => navigate("/dashboard/interview-coach")}
                      />
                    )}

                    {/* Quick-reply buttons (not shown on completion message) */}
                    {chat.role === "assistant" && !chat.isCompletion && chat.options && chat.options.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {chat.options.map((option) => (
                          <button
                            key={option}
                            type="button"
                            disabled={isBotTyping || isLoadingTwin}
                            onClick={() => void sendTwinMessage(option)}
                            className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                              option === FINISH_SIGNAL
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-secondary/20 text-foreground hover:bg-secondary/30"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isBotTyping && (
                <div className="flex gap-3">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-2 rounded-[14px] border border-border bg-card px-5 py-4 shadow-sm" aria-live="polite" aria-label="Economic Twin is typing">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-secondary [animation-delay:120ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
                    <span className="ml-2 text-sm font-medium text-muted-foreground">Thinking…</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input area - replaced by CTA panel once chat completes */}
          {chatComplete ? (
            <div className="sticky bottom-0 border-t border-border bg-background px-4 py-4 sm:px-5">
              <p className="text-xs text-center text-muted-foreground font-semibold mb-3">Session complete - what would you like to do next?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/dashboard/opportunities")}
                  className="shimmer flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white"
                  style={{ background: 'var(--gradient-hero)' }}
                >
                  <Briefcase className="h-4 w-4" />
                  Browse Opportunities
                </button>
                <Button variant="outline" onClick={() => navigate("/dashboard/interview-coach")} className="w-full">
                  <Mic className="mr-2 h-4 w-4" />
                  Practice Interview
                </Button>
              </div>
            </div>
          ) : (
            <form className="sticky bottom-0 border-t border-border bg-background px-4 py-3 sm:px-5" onSubmit={submitMessage}>
              <div className="flex h-12 items-center gap-2 rounded-[14px] border border-border bg-card px-3 shadow-sm">
                <Sparkles className="h-4 w-4 shrink-0 text-primary" />
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  disabled={isBotTyping || isLoadingTwin}
                  placeholder={isBotTyping ? "Economic Twin is thinking…" : isLoadingTwin ? "Loading your twin…" : "Select an option or type here…"}
                  className="h-full flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
                />
                <Button type="submit" size="icon" variant="secondary" disabled={isBotTyping || isLoadingTwin || !message.trim()} aria-label="Send message" className="h-8 w-8 rounded-xl">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-center text-[11px] font-semibold text-muted-foreground">Powered by your Economic Twin · SA career intelligence</p>
            </form>
          )}
        </section>
      </div>
    </main>
  );
};

export default TwinBuilder;
