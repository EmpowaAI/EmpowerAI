import { type FormEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { Bot, BriefcaseBusiness, ChevronDown, CircleDollarSign, Lightbulb, Send, Sparkles, Target, UserRound, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const profile = {
  name: "Economic Twin Profile",
  path: "Retail-ready career profile",
  industry: "Retail",
  level: "Entry-level / learnership ready",
  value: "ZAR 18,000 – 35,000 /mo",
  skills: ["Customer service", "Stock control", "Cash handling", "Communication", "Basic computer skills"],
};

const issues = [
  "No specific POS/till systems mentioned",
  "Limited measurable achievements",
  "No driver's licence indicated",
  "Matric subjects not listed",
  "Missing specific retail terminology",
  "No clear indication of shift flexibility",
];

const recommendations = [
  "Add specific POS/till systems used",
  "Include measurable achievements such as sales targets met",
  "List matric subjects for ATS keyword matching",
  "Mention availability for weekends and shifts",
  "Add retail-specific terminology like 'merchandising', 'inventory control', 'loss prevention'",
];

const mappedJobs = [
  "Photo Retoucher at BaubleBar Inc.",
  "Styling Enablement Communications Associate",
  "RETAIL LEARNERSHIP TONGAAT",
  "Learnership?- TimberCity Stikland",
  "Learnership?- TimberCity Tokai",
  "Learnership?- HHL Claremont",
  "Learnership - BUCO Nelspruit",
  "Learnership - BUCO Thabazimbi",
  "ENTRY-LEVEL Retail Store Agent",
  "Entry level Sales Assistant",
];

const nextSteps = [
  "Chat with your twin above to explore career paths, salary projections, and skill recommendations.",
  "Run simulations to see how different choices affect your income and employability over time.",
  "Browse job opportunities matched to your profile and skills.",
];

const quickQuestions = [
  "What skills am I missing?",
  "What's my market demand?",
  "Give me career recommendations",
  "What can I monetize?",
];

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  options?: string[];
};

const getTwinReply = (prompt: string) => {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("missing") || normalized.includes("skills")) {
    return {
      text: "The strongest gaps are POS/till systems, measurable sales achievements, merchandising, inventory control, loss prevention, and customer retention. Add these as proof-based CV bullets before applying widely.",
      options: ["How do I write this on my CV?", "What course should I take?", "What's my market demand?"],
    };
  }

  if (normalized.includes("market") || normalized.includes("demand")) {
    return {
      text: "Your current market demand is medium. Retail and entry-level sales roles are available, but your demand rises when the CV proves POS experience, stock control, sales targets, and shift flexibility.",
      options: ["Which jobs match me?", "How do I raise demand?", "Show salary benchmarks"],
    };
  }

  if (normalized.includes("recommend") || normalized.includes("career") || normalized.includes("next")) {
    return {
      text: "Focus on one practical path first: improve the CV evidence, then apply for retail assistant, cashier, stockroom, sales assistant, and retail learnership roles. This keeps your path clear and realistic.",
      options: ["What skills am I missing?", "Which jobs match me?", "What can I monetize?"],
    };
  }

  if (normalized.includes("monetize") || normalized.includes("money") || normalized.includes("income")) {
    return {
      text: "You can monetize customer service and stock control by helping small stores with weekend stock counts, product organization, basic sales admin, and customer support. Start with a simple one-day service package.",
      options: ["Create a 7-day action plan", "What should I charge?", "Which skill should I learn first?"],
    };
  }

  if (normalized.includes("salary") || normalized.includes("charge")) {
    return {
      text: "Use salary benchmarks by role, location, shift type, and commission potential. For side services, start with a fixed package price so the offer is simple and easy for small businesses to understand.",
      options: ["What's my market demand?", "What can I monetize?", "Give me career recommendations"],
    };
  }

  return {
    text: "I hear you. Based on your Economic Twin, the best move is to strengthen your CV evidence, focus on one income path, and compare opportunities by skills required, salary range, and how fast you can qualify.",
    options: quickQuestions,
  };
};

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

const DigitalTwin = () => {
  const [message, setMessage] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "Your Economic Twin is loaded. I can see your 5 core skills, your industry (retail), and your full career profile. Ask me anything — salary benchmarks, skill gaps, market demand, career paths, or what to focus on next.",
      options: quickQuestions,
    },
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatMessages, isBotTyping]);

  const sendTwinMessage = (prompt: string) => {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt || isBotTyping) return;

    const reply = getTwinReply(cleanPrompt);
    setChatMessages((current) => [...current, { id: Date.now(), role: "user", text: cleanPrompt }]);
    setIsBotTyping(true);

    window.setTimeout(() => {
      setChatMessages((current) => [
        ...current,
        { id: Date.now() + 1, role: "assistant", text: reply.text, options: reply.options },
      ]);
      setIsBotTyping(false);
    }, 850);
  };

  const submitMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) return;
    sendTwinMessage(message);
    setMessage("");
  };

  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <div className="mx-auto grid min-h-screen max-w-[1070px] border-x border-border bg-background lg:grid-cols-[390px_minmax(0,1fr)]">
        <aside className="h-screen overflow-y-auto border-b border-border bg-background px-4 py-4 lg:border-b-0 lg:border-r">
          <div className="space-y-3">
            <section className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserRound className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Profile</p>
                  <h1 className="mt-1 text-lg font-bold leading-tight text-primary">{profile.name}</h1>
                  <p className="mt-1 text-sm font-semibold leading-5 text-foreground">{profile.path}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-lg bg-muted/60 p-3">
                  <BriefcaseBusiness className="h-4 w-4 text-primary" />
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Industry</p>
                  <p className="font-semibold text-foreground">{profile.industry}</p>
                </div>
                <div className="rounded-lg bg-muted/60 p-3">
                  <CircleDollarSign className="h-4 w-4 text-secondary" />
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Value</p>
                  <p className="font-semibold text-foreground">Medium</p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm font-semibold text-foreground">
                Income potential · {profile.value}
              </div>
            </section>

            <InsightCard icon={Sparkles} title="Core skills · retail · v1">
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
                    {skill}
                  </span>
                ))}
              </div>
            </InsightCard>

            <InsightCard icon={Lightbulb} title="Potential gaps">
              <ul className="space-y-2.5">
                {issues.map((issue) => (
                  <li key={issue} className="flex gap-2 text-sm font-medium leading-5 text-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            </InsightCard>

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

            <InsightCard icon={Target} title="Mapped job titles">
              <div className="flex flex-wrap gap-2">
                {mappedJobs.map((job) => (
                  <span key={job} className="rounded-md border border-border bg-muted/60 px-2.5 py-1 text-xs font-semibold text-foreground">
                    {job}
                  </span>
                ))}
              </div>
            </InsightCard>

            <InsightCard icon={Zap} title="Next steps">
              <ol className="space-y-3">
                {nextSteps.map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm font-medium leading-5 text-foreground">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </InsightCard>
          </div>
        </aside>

        <section className="flex h-screen min-h-0 flex-col bg-background">
          <div className="flex-1 overflow-y-auto px-4 pb-8 pt-12 sm:px-5">
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
                      className={`px-4 py-3 text-sm font-bold leading-6 shadow-sm ${
                        chat.role === "user"
                          ? "rounded-2xl bg-primary text-primary-foreground"
                          : "rounded-[14px] border border-border bg-card text-foreground"
                      }`}
                    >
                      {chat.text}
                    </div>

                    {chat.role === "assistant" && chat.options && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {chat.options.map((option) => (
                          <button
                            key={option}
                            type="button"
                            disabled={isBotTyping}
                            onClick={() => sendTwinMessage(option)}
                            className="rounded-xl bg-secondary/30 px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/40 disabled:cursor-not-allowed disabled:opacity-60"
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
                    <span className="ml-2 text-sm font-medium text-muted-foreground">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          </div>

          <form className="border-t border-border bg-background px-4 py-3 sm:px-5" onSubmit={submitMessage}>
            <div className="flex h-12 items-center gap-2 rounded-[14px] border border-border bg-card px-3 shadow-sm">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                disabled={isBotTyping}
                placeholder={isBotTyping ? "Economic Twin is thinking..." : "Select an option or type here..."}
                className="h-full flex-1 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:text-muted-foreground"
              />
              <Button type="submit" size="icon" variant="secondary" disabled={isBotTyping || !message.trim()} aria-label="Send message" className="h-8 w-8 rounded-xl">
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

export default DigitalTwin;
