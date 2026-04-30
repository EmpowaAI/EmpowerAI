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
}

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  options?: string[];
};

const DEFAULT_QUICK_QUESTIONS = [
  "What skills am I missing?",
  "What's my market demand?",
  "Give me career recommendations",
  "What can I monetize?",
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

// Map the backend's nested twin shape to the flat TwinData interface the UI expects.
// Backend: identity.industry, economy.employabilityScore, skills.core, intelligence.recommendations, market.jobTitlesMapped
// Frontend: TwinData.industry, TwinData.empowermentScore, TwinData.skills (string[]), TwinData.recommendations, TwinData.mappedJobs
function normalizeTwin(raw: any): TwinData | null {
  if (!raw) return null;
  const isNested = (raw.identity || raw.economy) && !Array.isArray(raw.skills);
  if (!isNested) return raw as TwinData;

  const employabilityScore: number = raw.economy?.employabilityScore ?? 0;
  const incomeRange = raw.economy?.incomePotentialRange
    ? `R${(raw.economy.incomePotentialRange.min ?? 0).toLocaleString()} – R${(raw.economy.incomePotentialRange.max ?? 0).toLocaleString()}/month`
    : undefined;
  const coreSkills: string[] = Array.isArray(raw.skills?.core) ? raw.skills.core : [];
  const industry: string = raw.identity?.industry || "General";
  const demandRaw: string = raw.economy?.demandLevel ?? "";
  const marketDemand = demandRaw
    ? demandRaw.charAt(0) + demandRaw.slice(1).toLowerCase()
    : employabilityScore > 70 ? "High" : employabilityScore > 40 ? "Medium" : "Developing";

  return {
    profile: {
      name: raw.identity?.currentRole || "Economic Twin Profile",
      path: raw.identity?.targetRole || "Career profile",
      industry,
      level: raw.identity?.seniorityLevel || "",
      value: incomeRange || "—",
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
    name: raw.identity?.currentRole,
    industry,
    level: raw.identity?.seniorityLevel,
  };
}

// ── Component ──────────────────────────────────────────────────────────

const TwinBuilder = () => {
  const { progress, updateProgress } = useUser();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isLoadingTwin, setIsLoadingTwin] = useState(true);
  const [twinData, setTwinData] = useState<TwinData | null>(null);
  const [twinError, setTwinError] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  // Keep raw API twin shape so the chat context has all fields (identity, intelligence, etc.)
  const rawTwinRef = useRef<any>(null);

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
    rawTwinRef.current = raw; // preserve raw shape for chat context
    const skills = twin.profile?.skills ?? twin.skills ?? [];
    const industry = twin.profile?.industry ?? twin.industry ?? "General";
    localStorage.setItem("twinData", JSON.stringify(raw)); // persist raw so next load can re-normalize
    setChatMessages([{
      id: 1,
      role: "assistant",
      text: `Your Economic Twin is loaded. I can see your ${skills.length > 0 ? `${skills.length} core skills` : "profile"}, your industry (${industry}), and your full career profile. Ask me anything — salary benchmarks, skill gaps, market demand, career paths, or what to focus on next.`,
      options: DEFAULT_QUICK_QUESTIONS,
    }]);
    return true;
  };

  // Load twin data from localStorage first, then fallback to API, then auto-build if CV is done
  const loadTwinData = useCallback(async () => {
    setIsLoadingTwin(true);
    setTwinError("");

    try {
      // 1. Try localStorage first (fastest)
      const raw = localStorage.getItem("twinData");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (applyTwin(parsed)) {
          setIsLoadingTwin(false);
          return;
        }
      }

      // 2. Fetch from API
      const response = await twinAPI.get();
      const apiTwin = response?.data?.twin ?? null;

      if (apiTwin) {
        applyTwin(apiTwin);
        return;
      }

      // 3. No twin in DB — if CV analysis was done, try to build one now
      const cvDone = localStorage.getItem("cvCompleted") === "true";
      if (cvDone) {
        setChatMessages([{
          id: 1, role: "assistant",
          text: "Building your Economic Twin from your CV analysis — this takes a moment...",
          options: [],
        }]);
        try {
          const buildResp = await twinAPI.buildFromCv();
          const builtTwin = buildResp?.data?.twin ?? null;
          if (builtTwin && applyTwin(builtTwin)) {
            localStorage.setItem("twinCompleted", "true");
            return;
          }
          // Fallback: build response had no twin shape — try a separate GET
          const retryResponse = await twinAPI.get();
          const fetchedTwin = retryResponse?.data?.twin ?? null;
          if (fetchedTwin && applyTwin(fetchedTwin)) {
            localStorage.setItem("twinCompleted", "true");
            return;
          }
        } catch (buildErr: any) {
          const status = buildErr?.status ?? buildErr?.response?.status;
          if (status === 404) {
            // CV profile not in DB — try to restore from locally-cached analysis
            // so users who already analyzed their CV don't need to re-upload.
            const cachedAnalysis = getStoredCvAnalysis<Record<string, unknown>>();
            if (cachedAnalysis) {
              try {
                await cvAPI.restoreFromCache(cachedAnalysis);
                // Profile restored — retry the build
                const retryBuild = await twinAPI.buildFromCv();
                const restoredTwin = retryBuild?.data?.twin ?? null;
                if (restoredTwin && applyTwin(restoredTwin)) {
                  localStorage.setItem("twinCompleted", "true");
                  updateProgress("twinCompleted", true);
                  return;
                }
              } catch {
                // Restore or retry failed — fall through to redirect
              }
            }
            // No cache or restore failed — clear state and send to cv-analyzer
            localStorage.removeItem("cvCompleted");
            localStorage.removeItem("twinCompleted");
            localStorage.removeItem("twinData");
            localStorage.removeItem("cvAnalysisData");
            updateProgress("cvCompleted", false);
            updateProgress("twinCompleted", false);
            navigate("/dashboard/cv-analyzer");
            return;
          }
          // Other errors (422, 500, network) fall through to the error message below
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

  const sendTwinMessage = async (prompt: string) => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || isBotTyping) return;

    const userMsg: ChatMessage = { id: Date.now(), role: "user", text: cleanPrompt };
    setChatMessages((current) => [...current, userMsg]);
    setIsBotTyping(true);

    const newHistory = [...chatHistory, { role: "user", content: cleanPrompt }];
    setChatHistory(newHistory);

    try {
      const response = await twinAPIReal.chatMessage(
        cleanPrompt,
        newHistory,
        rawTwinRef.current ?? twinData ?? {},
        false
      );

      const replyText: string =
        response?.data?.reply ??
        response?.reply ??
        response?.data?.message ??
        "I couldn't process your request right now. Please try again.";

      const assistantMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: replyText,
        options: DEFAULT_QUICK_QUESTIONS,
      };

      setChatMessages((current) => [...current, assistantMsg]);
      setChatHistory((h) => [...h, { role: "assistant", content: replyText }]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        text: "I had trouble connecting. Please check your internet connection and try again.",
        options: DEFAULT_QUICK_QUESTIONS,
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

  // Derived display values
  const profile = twinData?.profile;
  const displayName = profile?.name ?? twinData?.name ?? "Economic Twin Profile";
  const displayPath = profile?.path ?? (twinData?.careerPaths?.[0]?.title ?? "Career profile");
  const displayIndustry = profile?.industry ?? twinData?.industry ?? "General";
  const displayValue = profile?.value ?? twinData?.economy?.incomeRange ?? "—";
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

        {/* ── Sidebar — shown below chat on mobile, left column on desktop ── */}
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

                {displayValue !== "—" && (
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

              {/* CTA */}
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

        {/* ── Chat Panel — shown first on mobile ── */}
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

                    {chat.role === "assistant" && chat.options && chat.options.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {chat.options.map((option) => (
                          <button
                            key={option}
                            type="button"
                            disabled={isBotTyping || isLoadingTwin}
                            onClick={() => void sendTwinMessage(option)}
                            className="rounded-xl bg-secondary/20 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/30 disabled:cursor-not-allowed disabled:opacity-60"
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
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:120ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:240ms]" />
                    <span className="ml-2 text-sm font-medium text-muted-foreground">Thinking…</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

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
        </section>
      </div>
    </main>
  );
};

export default TwinBuilder;
