// frontend/src/pages/twin/MyTwin.tsx
// Split layout: Twin data dashboard (left) + Chat with twin (right)
// Fetches twin from GET /my-twin, chats via POST /chat/twin

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Send, Sparkles, User, Zap, TrendingUp,
  Target, ShieldCheck, AlertTriangle, Lightbulb, BarChart2,
  Cpu, Star, ChevronDown, ChevronUp, RefreshCw, CircleDot,
  BadgeCheck, Layers, BookOpen, WifiOff
} from "lucide-react";
import { cn } from "../../lib/utils";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/user-context";
import { getMyTwin, chatWithTwin as apiChatWithTwin } from "../../api/services/twinService";

// ─── Types ────────────────────────────────────────────────────────────────────

interface EconomicTwin {
  _id?: string;
  user?: string;
  cvProfile?: string;
  status?: string;
  identity?: {
    currentRole?: string;
    targetRole?: string;
    seniorityLevel?: string;
    industry?: string;
  };
  skills?: {
    core?: string[];
    missing?: string[];
    emerging?: string[];
    monetizable?: string[];
  };
  economy?: {
    employabilityScore?: number;
    marketValueScore?: number;
    demandLevel?: string;
    incomePotentialRange?: {
      min?: number;
      max?: number;
      currency?: string;
    };
  };
  intelligence?: {
    strengths?: string[];
    weaknesses?: string[];
    opportunities?: string[];
    threats?: string[];
    recommendations?: string[];
  };
  market?: {
    trendingSkills?: string[];
    decliningSkills?: string[];
    jobTitlesMapped?: string[];
    competitorRoles?: string[];
  };
  evolution?: {
    version?: number;
    lastUpdatedBy?: string;
    confidenceScore?: number;
  };
  lastCalculatedAt?: string;
  chatHistory?: unknown[];
  simulationHistory?: unknown[];
}

// Chat message shape sent to POST /chat/twin
interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

interface DisplayMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  options?: string[];
  allowMultiple?: boolean;
  timestamp: Date;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function demandColor(level?: string) {
  switch (level?.toUpperCase()) {
    case "HIGH": return "text-green-400";
    case "MEDIUM": return "text-amber-400";
    default: return "text-red-400";
  }
}

function demandBg(level?: string) {
  switch (level?.toUpperCase()) {
    case "HIGH": return "bg-green-500/15 border-green-500/30";
    case "MEDIUM": return "bg-amber-500/15 border-amber-500/30";
    default: return "bg-red-500/15 border-red-500/30";
  }
}

function CollapsibleSection({
  title, icon, children, defaultOpen = true,
}: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border/60 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-card/60 hover:bg-muted/30 transition-colors"
      >
        <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {icon}{title}
        </span>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-3 bg-card/30">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MyTwin() {
  const navigate = useNavigate();

  const { user, updateProgress, cvData } = useUser();

  // Twin data state
  const [twin, setTwin] = useState<EconomicTwin | null>(null);
  const [twinLoading, setTwinLoading] = useState(true);
  const [twinError, setTwinError] = useState("");

  // Chat state
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [mobileTab, setMobileTab] = useState<"profile" | "chat">("profile");
  const [userInput, setUserInput] = useState("");
  const [chatError, setChatError] = useState("");
  const [selectedMultiple, setSelectedMultiple] = useState<Set<string>>(new Set());

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    // Auto-focus input field when messages change or twin loads
    if (inputRef.current && !isTyping && messages.length > 0) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping]);

  // ── Fetch twin from API on mount ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const fetchTwin = async () => {
      setTwinLoading(true);
      setTwinError("");
      try {
        const res = await getMyTwin();
        // Backend returns: { status: 'success', data: { twin } }
        const data: EconomicTwin = res?.data?.twin ?? res?.twin ?? res;
        if (!cancelled) {
          setTwin(data);
          seedGreeting(data);
          if (data && Object.keys(data).length > 0) {
            updateProgress('twinCompleted', true);
          }
        }
      } catch (err: any) {
        if (!cancelled) {
          const msg = err?.response?.data?.message || err?.message || "Failed to load twin data.";
          setTwinError(msg);
          seedGreeting(null);
        }
      } finally {
        if (!cancelled) setTwinLoading(false);
      }
    };

    fetchTwin();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seedGreeting = (data: EconomicTwin | null) => {
    // Only treat as loaded if it has identity and core skills
    const isPopulated = data && data.identity?.currentRole && data.identity.currentRole !== "UNDEFINED" && (data.skills?.core?.length ?? 0) > 0;

    if (isPopulated) {
      const text = `Your Economic Twin is loaded. I can see your **${data.skills?.core?.length ?? 0} core skills**, your industry (**${data.identity?.industry ?? "technology"}**), and your full career profile.\n\nAsk me anything — salary benchmarks, skill gaps, market demand, career paths, or what to focus on next.`;

      const greeting: DisplayMessage = {
        id: "ai-greeting",
        sender: "ai",
        text,
        options: [
          "What skills am I missing?",
          "What's my market demand?",
          "Give me career recommendations",
          "What can I monetize?",
        ],
        timestamp: new Date(),
      };
      setMessages([greeting]);
      setChatHistory([{ role: "assistant", content: text }]);
    } else {
      // No twin yet, start the profile building quiz
      sendToAI([]);
    }
  };

  // ── System context injected at top of every request ──────────────────────────
  const buildSystemContext = useCallback((): string => {
    if (!twin) return "";
    return `You are an AI career advisor chatting with a user about their Economic Twin — an AI-generated career profile built from their CV analysis. Be specific, practical, and South Africa-aware. Use markdown. Keep responses concise but actionable.

TWIN DATA:
- Identity: currentRole=${twin.identity?.currentRole}, targetRole=${twin.identity?.targetRole}, seniorityLevel=${twin.identity?.seniorityLevel}, industry=${twin.identity?.industry}
- Economy: employabilityScore=${twin.economy?.employabilityScore}, marketValueScore=${twin.economy?.marketValueScore}, demandLevel=${twin.economy?.demandLevel}, incomePotential=${twin.economy?.incomePotentialRange?.currency} ${twin.economy?.incomePotentialRange?.min}–${twin.economy?.incomePotentialRange?.max}/mo
- Core Skills (${twin.skills?.core?.length ?? 0}): ${twin.skills?.core?.join(", ")}
- Missing Skills: ${twin.skills?.missing?.join(", ") || "none"}
- Emerging Skills: ${twin.skills?.emerging?.join(", ") || "none yet"}
- Monetizable: ${twin.skills?.monetizable?.join(", ") || "none identified yet"}
- Strengths: ${twin.intelligence?.strengths?.join("; ")}
- Weaknesses: ${twin.intelligence?.weaknesses?.join("; ")}
- Recommendations: ${twin.intelligence?.recommendations?.join("; ")}
- Trending in market: ${twin.market?.trendingSkills?.join(", ") || "none"}
- Mapped job titles: ${twin.market?.jobTitlesMapped?.join(", ") || "none"}
- Confidence: ${twin.evolution?.confidenceScore ?? 0}/100 (v${twin.evolution?.version ?? 1}, by ${twin.evolution?.lastUpdatedBy ?? "system"})`.trim();
  }, [twin]);

  // ── Send to POST /chat/twin ───────────────────────────────────────────────────
  const sendToAI = async (history: ChatMsg[]) => {
    setIsTyping(true);
    setChatError("");

    try {
      // Detect if the loaded twin actually has data. If not, use cvData fallback.
      const isTwinPopulated = twin && twin.identity?.currentRole && twin.identity.currentRole !== "UNDEFINED" && (twin.skills?.core?.length ?? 0) > 0;

      const cvContext = isTwinPopulated ? {
        name: user?.name || "User",
        sections: {
          about: "",
          skills: twin.skills?.core || [],
          education: cvData?.sections?.education || [],
          experience: cvData?.sections?.experience || [],
          achievements: twin.intelligence?.strengths || []
        },
        score: twin.economy?.employabilityScore || 50,
        industry: twin.identity?.industry || "technology",
        strengths: twin.intelligence?.strengths || [],
        weaknesses: twin.intelligence?.weaknesses || [],
        recommendations: twin.intelligence?.recommendations || [],
        missingSkills: twin.skills?.missing || [],
        currentRole: twin.identity?.currentRole || "",
        skills: twin.skills?.core || [],
        targetRole: twin.identity?.targetRole || twin.identity?.currentRole || "",
        yearsExperience: twin.identity?.seniorityLevel === "Senior" ? 7 : twin.identity?.seniorityLevel === "Mid" ? 3 : 0,
        confidenceScore: twin.evolution?.confidenceScore || 50
      } : cvData ? {
        name: user?.name || "User",
        sections: cvData.sections || {
          about: cvData.sections?.about || "",
          skills: cvData.sections?.skills || [],
          education: cvData.sections?.education || [],
          experience: cvData.sections?.experience || [],
        },
        score: cvData.score || 0,
        industry: (cvData as any).industry || "Technology",
        readinessLevel: cvData.readinessLevel,
        strengths: (cvData as any).strengths || [],
        weaknesses: (cvData as any).weaknesses || [],
        recommendations: cvData.recommendations || [],
        missingSkills: cvData.missingKeywords || [],
        currentRole: cvData.sections?.experience?.[0]?.split('\n')[0] || "",
        targetRole: cvData.sections?.experience?.[0]?.split('\n')[0] || "",
        yearsExperience: 0,
        confidenceScore: 50
      } : {
        name: user?.name || "User",
        sections: { about: "", skills: [], education: [], experience: [], achievements: [] }
      };

      const res = await apiChatWithTwin(history, cvContext);
      // Backend returns: { status: 'success', data: { reply, options, ... } }
      const rawData = res?.data || res;
      const reply: string = rawData?.reply || rawData?.message || "I couldn't generate a response.";
      let options: string[] = Array.isArray(rawData?.options) ? rawData.options : [];
      const allowMultiple: boolean = res?.data?.allowMultiple || false;
      const isComplete: boolean = res?.data?.isComplete || false;
      const aiProfile = res?.data?.profile;

      // FALLBACK: Parse [OPTIONS: "A", "B"] from text if the array is missing
      if (options.length === 0) {
        const match = reply.match(/\[OPTIONS:\s*(.+?)\]/);
        if (match) {
          const raw = match[1];
          const matches = raw.match(/"([^"]+)"/g);
          options = matches ? matches.map(s => s.replace(/"/g, '')) : raw.split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        }
      }

      // Clean the display text by removing the metadata blocks
      const cleanText = reply.replace(/\[OPTIONS:\s*.+?\]/g, '').replace(/\[COMPLETE\]/g, '').trim();

      // If the quiz is finished, map flat AI profile to nested EconomicTwin structure
      if (isComplete && aiProfile) {
        const mappedTwin: EconomicTwin = {
          identity: {
            currentRole: (cvData?.sections?.experience?.[0]?.split('\n')[0]) || aiProfile.careerStage || 'Professional',
            seniorityLevel: aiProfile.careerStage || (cvData as any)?.readinessLevel || 'Early Career',
            industry: aiProfile.industry || (cvData as any)?.industry || 'Technology',
            targetRole: aiProfile.goals || ''
          },
          skills: {
            core: Array.isArray(aiProfile.skills) ? aiProfile.skills : [],
            missing: []
          },
          economy: {
            employabilityScore: aiProfile.empowermentScore || 50,
            demandLevel: 'MEDIUM',
            incomePotentialRange: { min: 5000, max: 15000, currency: 'R' }
          },
          intelligence: {
            strengths: [aiProfile.careerStage, "Market Ready"],
            weaknesses: aiProfile.challenges ? [aiProfile.challenges] : [],
            recommendations: aiProfile.goals ? [`Focus on achieving: ${aiProfile.goals}`] : ["Explore new skill paths"],
          },
          status: 'ACTIVE'
        };
        setTwin(mappedTwin);
        updateProgress('twinCompleted', true);
        
        // Persist locally for dashboard fallback
        try {
          localStorage.setItem('twinData', JSON.stringify(mappedTwin));
          window.dispatchEvent(new Event('twinCompleted'));
        } catch (e) { console.error("Failed to persist twin", e); }
      }

      const aiMsg: DisplayMessage = {
        id: `ai-${Date.now()}`,
        text: cleanText,
        options,
        allowMultiple,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setChatHistory((prev) => [...prev, { role: "assistant", content: reply }]);
      
      // Reset multi-select when showing new question
      if (allowMultiple) {
        setSelectedMultiple(new Set());
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to get a response.";
      setChatError(msg);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSend = (text: string) => {
    if (!text.trim() || isTyping) return;
    
    // Clear input immediately for instant feedback
    const trimmedText = text.trim();
    setUserInput("");

    const userMsg: DisplayMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmedText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev.map((m) => ({ ...m, options: undefined })), userMsg]);

    const newHistory: ChatMsg[] = [...chatHistory, { role: "user", content: trimmedText }];
    setChatHistory(newHistory);
    setMobileTab("chat");
    sendToAI(newHistory);
  };

  const handleMultipleSelect = (option: string) => {
    const updated = new Set(selectedMultiple);
    if (updated.has(option)) {
      updated.delete(option);
    } else {
      updated.add(option);
    }
    setSelectedMultiple(updated);
  };

  const handleMultipleSubmit = () => {
    if (selectedMultiple.size === 0) return;
    const selected = Array.from(selectedMultiple).join(", ");
    handleSend(selected);
  };

  const lastMessage = messages[messages.length - 1];
  const hasOptions = lastMessage?.sender === "ai" && (lastMessage?.options?.length ?? 0) > 0;

  // ─── Twin Profile Panel ──────────────────────────────────────────────────────

  const TwinPanel = () => {
    if (twinLoading) return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
          <RefreshCw className="h-6 w-6 text-primary" />
        </motion.div>
        <p className="text-xs text-muted-foreground">Loading twin data...</p>
      </div>
    );

    if (twinError) return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
        <WifiOff className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-destructive">{twinError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-xs rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors flex items-center gap-2"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    );

    if (!twin) return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
        <Cpu className="h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No twin found. Analyze your CV to build one.</p>
        <button
          onClick={() => navigate("/dashboard/cv-analyzer")}
          className="px-4 py-2 text-xs rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Analyze CV First
        </button>
      </div>
    );

    const { identity, economy, skills, intelligence, market, evolution } = twin;
    const currency = economy?.incomePotentialRange?.currency ?? "ZAR";

    return (
      <div className="h-full overflow-y-auto scrollbar-thin px-4 py-5 space-y-3">

        {/* Identity card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border p-4"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CircleDot className="h-3 w-3 text-green-400" />
                <span className="text-[10px] uppercase tracking-widest text-green-400 font-bold">
                  {twin.status ?? "ACTIVE"}
                </span>
              </div>
              <h2 className="font-bold text-foreground text-base leading-tight">
                {identity?.currentRole === "UNDEFINED" ? "Role Not Defined" : identity?.currentRole ?? "—"}
              </h2>
              {identity?.targetRole && identity.targetRole !== "UNDEFINED" && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  → Target: {identity.targetRole}
                </p>
              )}
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Seniority</span>
              <span className="text-xs font-bold text-primary">{identity?.seniorityLevel ?? "—"}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium capitalize">
              {identity?.industry ?? "—"}
            </span>
            <span className="text-[10px] text-muted-foreground">
              v{evolution?.version ?? 1} · {evolution?.lastUpdatedBy ?? "system"}
            </span>
          </div>
        </motion.div>

        {/* Economy */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-xl border border-border p-4"
        >
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-3 flex items-center gap-2">
            <BarChart2 className="h-3.5 w-3.5" /> Economy
          </p>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="text-center">
              <p className="text-xl font-bold font-mono text-foreground">{economy?.employabilityScore ?? 0}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Employability</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold font-mono text-foreground">{economy?.marketValueScore ?? 0}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Market Value</p>
            </div>
            <div className="text-center">
              <p className={cn("text-sm font-bold", demandColor(economy?.demandLevel))}>
                {economy?.demandLevel ?? "LOW"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Demand</p>
            </div>
          </div>
          <div className={cn("rounded-lg border p-3 text-center text-xs", demandBg(economy?.demandLevel))}>
            <span className="text-muted-foreground">Income Potential · </span>
            <span className="font-semibold text-foreground">
              {currency} {(economy?.incomePotentialRange?.min ?? 0).toLocaleString()} – {(economy?.incomePotentialRange?.max ?? 0).toLocaleString()}
            </span>
            <span className="text-muted-foreground"> /mo</span>
          </div>
        </motion.div>

        {/* Core Skills */}
        <CollapsibleSection title="Core Skills" icon={<Layers className="h-3.5 w-3.5" />}>
          <div className="flex flex-wrap gap-1.5">
            {(skills?.core ?? []).map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[11px] text-primary font-medium">
                {s}
              </span>
            ))}
            {(skills?.core?.length ?? 0) === 0 && (
              <p className="text-xs text-muted-foreground">No core skills mapped yet.</p>
            )}
          </div>
        </CollapsibleSection>

        {/* Missing Skills */}
        <CollapsibleSection
          title={`Missing Skills${skills?.missing?.length ? ` (${skills.missing.length})` : ""}`}
          icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
          defaultOpen={false}
        >
          <div className="flex flex-wrap gap-1.5">
            {(skills?.missing ?? []).map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400 font-medium">
                {s}
              </span>
            ))}
            {(skills?.missing?.length ?? 0) === 0 && (
              <p className="text-xs text-muted-foreground">No missing skills identified.</p>
            )}
          </div>
        </CollapsibleSection>

        {/* Emerging Skills — only shown if populated */}
        {(skills?.emerging?.length ?? 0) > 0 && (
          <CollapsibleSection title="Emerging Skills" icon={<TrendingUp className="h-3.5 w-3.5 text-blue-400" />} defaultOpen={false}>
            <div className="flex flex-wrap gap-1.5">
              {skills!.emerging!.map((s) => (
                <span key={s} className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-400 font-medium">{s}</span>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Strengths */}
        <CollapsibleSection title="Strengths" icon={<ShieldCheck className="h-3.5 w-3.5 text-green-400" />}>
          <ul className="space-y-1.5">
            {(intelligence?.strengths ?? []).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <BadgeCheck className="h-3 w-3 text-green-400 flex-shrink-0 mt-0.5" /> {s}
              </li>
            ))}
            {(intelligence?.strengths?.length ?? 0) === 0 && (
              <p className="text-xs text-muted-foreground">No strengths mapped yet.</p>
            )}
          </ul>
        </CollapsibleSection>

        {/* Weaknesses */}
        <CollapsibleSection title="Weaknesses" icon={<AlertTriangle className="h-3.5 w-3.5 text-amber-400" />} defaultOpen={false}>
          <ul className="space-y-1.5">
            {(intelligence?.weaknesses ?? []).map((w, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" /> {w}
              </li>
            ))}
            {(intelligence?.weaknesses?.length ?? 0) === 0 && (
              <p className="text-xs text-muted-foreground">No weaknesses identified.</p>
            )}
          </ul>
        </CollapsibleSection>

        {/* Recommendations */}
        <CollapsibleSection title="Recommendations" icon={<Lightbulb className="h-3.5 w-3.5 text-primary" />} defaultOpen={false}>
          <ol className="space-y-1.5 list-none">
            {(intelligence?.recommendations ?? []).map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[9px] flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                  {i + 1}
                </span>
                {r}
              </li>
            ))}
            {(intelligence?.recommendations?.length ?? 0) === 0 && (
              <p className="text-xs text-muted-foreground">No recommendations yet.</p>
            )}
          </ol>
        </CollapsibleSection>

        {/* Mapped Job Titles — only shown if populated */}
        {(market?.jobTitlesMapped?.length ?? 0) > 0 && (
          <CollapsibleSection title="Mapped Job Titles" icon={<Target className="h-3.5 w-3.5 text-primary" />} defaultOpen={false}>
            <div className="flex flex-wrap gap-1.5">
              {market!.jobTitlesMapped!.map((t) => (
                <span key={t} className="px-2 py-0.5 rounded-md bg-muted border border-border text-[11px] text-foreground">{t}</span>
              ))}
            </div>
          </CollapsibleSection>
        )}

        {/* Next Steps */}
        <CollapsibleSection title="Next Steps" icon={<Zap className="h-3.5 w-3.5 text-primary" />} defaultOpen={true}>
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[9px] flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                1
              </span>
              <span>Chat with your twin above to explore career paths, salary projections, and skill recommendations.</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="h-4 w-4 rounded-full bg-primary/20 text-primary text-[9px] flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                2
              </span>
              <span>Run simulations to see how different choices affect your income and employability over time.</span>
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="h-4 w-4 rounded-full bg-primary text-[9px] flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                3
              </span>
              <span>Browse job opportunities matched to your profile and skills.</span>
            </div>
          </div>
        </CollapsibleSection>

        {/* Confidence footer */}
        <div className="border border-border/40 rounded-xl p-3 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Star className="h-3 w-3" /> Confidence Score
          </span>
          <span className="text-sm font-bold font-mono text-foreground">
            {evolution?.confidenceScore ?? 0}
            <span className="text-xs text-muted-foreground font-normal">/100</span>
          </span>
        </div>

      </div>
    );
  };

  // ─── Chat Panel ──────────────────────────────────────────────────────────────

  const ChatPanel = () => (
    <div className="flex flex-col h-full">

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-4 py-5 space-y-1">

          {messages.map((msg, idx) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={cn("flex gap-3 py-2", msg.sender === "user" ? "justify-end" : "justify-start")}
            >
              {msg.sender === "ai" && (
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center mt-1">
                  <Cpu className="h-4 w-4 text-primary" />
                </div>
              )}

              <div className={cn("max-w-[80%] space-y-2", msg.sender === "user" ? "items-end flex flex-col" : "items-start")}>
                <div className={cn(
                  "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card border border-border/60 text-foreground rounded-bl-sm"
                )}>
                  {msg.sender === "ai" ? (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>

                {/* Quick reply chips - Single select */}
                {msg.sender === "ai" &&
                  msg.options && msg.options.length > 0 &&
                  idx === messages.length - 1 &&
                  !isTyping &&
                  !msg.allowMultiple && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="flex flex-wrap gap-2"
                    >
                      {msg.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleSend(opt)}
                          className="px-3 py-1.5 rounded-xl text-xs font-medium border border-border/60 bg-secondary/40 hover:border-primary/50 hover:bg-primary/10 text-foreground transition-all"
                        >
                          {opt}
                        </button>
                      ))}
                    </motion.div>
                  )}

                {/* Quick reply chips - Multi select */}
                {msg.sender === "ai" &&
                  msg.options && msg.options.length > 0 &&
                  idx === messages.length - 1 && 
                  !isTyping &&
                  msg.allowMultiple && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                      className="space-y-2 w-full"
                    >
                      <div className="flex flex-wrap gap-2">
                        {msg.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => handleMultipleSelect(opt)}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all",
                              selectedMultiple.has(opt)
                                ? "border-primary bg-primary/20 text-foreground"
                                : "border-border/60 bg-secondary/40 hover:border-primary/50 hover:bg-primary/10 text-foreground"
                            )}
                          >
                            {selectedMultiple.has(opt) ? "✓ " : ""}{opt}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleMultipleSubmit}
                        disabled={selectedMultiple.size === 0 || isTyping}
                        className="w-full px-3 py-1.5 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                      >
                        Confirm Selection ({selectedMultiple.size} selected)
                      </button>
                    </motion.div>
                  )}
              </div>

              {msg.sender === "user" && (
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center mt-1">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3 py-2"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Cpu className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-card border border-border/60 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-1.5 w-1.5 rounded-full bg-primary/60"
                      animate={{ y: [0, -4, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat error */}
          <AnimatePresence>
            {chatError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-xs text-destructive text-center"
              >
                {chatError}
                <button onClick={() => setChatError("")} className="ml-2 underline">Dismiss</button>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-border bg-card/60 backdrop-blur-md px-4 py-3">
        <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-xl px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
          <Sparkles className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && userInput.trim()) {
                handleSend(userInput);
              }
            }}
            onFocus={(e) => e.currentTarget.style.outline = 'none'}
            placeholder={hasOptions ? "Or type your own answer..." : "Ask your twin anything..."}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 outline-none py-0.5"
            disabled={isTyping}
          />
          <button
            onClick={() => handleSend(userInput)}
            disabled={!userInput.trim() || isTyping}
            className="h-7 w-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            title="Send"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-1.5">
          Powered by your Economic Twin · SA career intelligence
        </p>
      </div>
    </div>
  );

  // ─── Root Layout ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-[100dvh] bg-background">

      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <div className={cn(
                "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card",
                twinLoading ? "bg-amber-400 animate-pulse" : twin ? "bg-green-400" : "bg-muted-foreground"
              )} />
            </div>
            <div>
              <h1 className="font-display text-sm font-bold text-foreground">My Economic Twin</h1>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Zap className="h-2.5 w-2.5 text-primary" />
                {twinLoading
                  ? "Loading..."
                  : twin
                    ? `${twin.skills?.core?.length ?? 0} skills · ${twin.identity?.industry ?? "Technology"} · v${twin.evolution?.version ?? 1}`
                    : "No twin data"}
              </p>
            </div>
          </div>

          {/* Mobile tab switcher */}
          <div className="flex lg:hidden bg-muted rounded-lg p-0.5">
            <button
              onClick={() => setMobileTab("profile")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                mobileTab === "profile" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <BookOpen className="h-3.5 w-3.5 inline mr-1" />Profile
            </button>
            <button
              onClick={() => setMobileTab("chat")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                mobileTab === "chat" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <Brain className="h-3.5 w-3.5 inline mr-1" />Chat
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-hidden flex">

        {/* Desktop — left: twin profile */}
        <div className="hidden lg:flex lg:w-[380px] xl:w-[420px] flex-shrink-0 border-r border-border flex-col overflow-hidden">
          <TwinPanel />
        </div>

        {/* Desktop — right: chat */}
        <div className="hidden lg:flex flex-1 flex-col overflow-hidden">
          <ChatPanel />
        </div>

        {/* Mobile — tab switched */}
        <div className="flex lg:hidden flex-1 flex-col overflow-hidden">
          {mobileTab === "profile" ? <TwinPanel /> : <ChatPanel />}
        </div>

      </div>
    </div>
  );
}
