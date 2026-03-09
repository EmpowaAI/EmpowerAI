import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Send, Sparkles, ChevronRight, Bot, User, Zap } from "lucide-react";
import { cn } from "../lib/utils";
import { streamChat, parseAIResponse, type ChatMsg } from "../lib/chat-stream";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom"; // Add this for navigation

interface TwinProfile {
  name?: string;
  careerStage?: string;
  province?: string;
  industry?: string;
  education?: string;
  skills?: string[];
  challenges?: string;
  goals?: string;
  empowermentScore?: number;
  [key: string]: unknown; // Allow for additional properties
}

interface DisplayMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  options?: string[];
  isComplete?: boolean;
  timestamp: Date;
}

const thinkingPhrases = [
  "Analysing your profile...",
  "Scanning SA job market trends...",
  "Cross-referencing skill demand by province...",
  "Building your career DNA...",
  "Generating personalised insights...",
];

export default function TwinBuilder() {
  const navigate = useNavigate(); // Add navigate hook
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMsg[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [showThinking, setShowThinking] = useState(false);
  const [thinkingIdx, setThinkingIdx] = useState(0);
  const [profileComplete, setProfileComplete] = useState(false);
  const [profileData, setProfileData] = useState<TwinProfile | null>(null);
  const [error, setError] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  // Start conversation
  useEffect(() => {
    sendToAI([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendToAI = async (history: ChatMsg[]) => {
    setIsTyping(true);
    setError("");
    let fullText = "";

    await streamChat({
      messages: history,
      onDelta: (chunk) => {
        fullText += chunk;
        // Update the last AI message progressively
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          const parsed = parseAIResponse(fullText);
          if (last?.sender === "ai" && last.id.startsWith("ai-stream")) {
            return prev.map((m, i) =>
              i === prev.length - 1
                ? { ...m, text: parsed.cleanText, options: parsed.options }
                : m
            );
          }
          return [
            ...prev,
            {
              id: `ai-stream-${Date.now()}`,
              sender: "ai",
              text: parsed.cleanText,
              options: parsed.options,
              timestamp: new Date(),
            },
          ];
        });
      },
      onDone: () => {
        setIsTyping(false);
        const parsed = parseAIResponse(fullText);

        // Finalize the message with options
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].sender === "ai") {
            updated[lastIdx] = {
              ...updated[lastIdx],
              text: parsed.cleanText,
              options: parsed.options,
              isComplete: parsed.isComplete,
            };
          }
          return updated;
        });

        // Update chat history
        setChatHistory((prev) => [...prev, { role: "assistant", content: fullText }]);

        if (parsed.isComplete && parsed.profile) {
          handleProfileComplete(parsed.profile as TwinProfile);
        }

        setTimeout(() => inputRef.current?.focus(), 100);
      },
      onError: (err) => {
        setIsTyping(false);
        setError(err);
      },
    });
  };

  const handleProfileComplete = (profile: TwinProfile) => {
    setProfileData(profile);
    localStorage.setItem("twinData", JSON.stringify(profile));
    localStorage.setItem("twinCreated", "true");

    setTimeout(() => {
      setShowThinking(true);
      const interval = setInterval(() => {
        setThinkingIdx((prev) => {
          if (prev >= thinkingPhrases.length - 1) {
            clearInterval(interval);
            setTimeout(() => {
              setShowThinking(false);
              setProfileComplete(true);
            }, 1500);
            return prev;
          }
          return prev + 1;
        });
      }, 1200);
    }, 1000);
  };

  const handleSend = (text: string) => {
    if (!text.trim() || isTyping) return;
    setUserInput("");

    const userMsg: DisplayMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev.map(m => ({ ...m, options: undefined })), userMsg]);

    const newHistory: ChatMsg[] = [...chatHistory, { role: "user", content: text.trim() }];
    setChatHistory(newHistory);
    sendToAI(newHistory);
  };

  const handleOptionClick = (option: string) => handleSend(option);

  const handleContinueToDashboard = () => {
    navigate("/dashboard"); // Navigate to dashboard
  };

  const lastMessage = messages[messages.length - 1];
  const hasOptions = lastMessage?.sender === "ai" && (lastMessage?.options?.length ?? 0) > 0;

  // Helper function to safely render profile values
  const renderProfileValue = (value: unknown): string => {
    if (value === null || value === undefined) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    if (Array.isArray(value)) return value.join(", ");
    return String(value);
  };

  return (
    <div className="flex flex-col h-screen bg-background chat-gradient">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center glow-primary">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-card" />
          </div>
          <div>
            <h1 className="font-display text-sm font-semibold text-foreground">
              Digital Twin Builder
            </h1>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Zap className="h-3 w-3 text-primary" />
              SA Career Intelligence • Active
            </p>
          </div>
        </div>
      </div>

      {/* Thinking Overlay */}
      <AnimatePresence>
        {showThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-8 max-w-md px-6"
            >
              <div className="mx-auto h-20 w-20 rounded-2xl bg-primary/20 flex items-center justify-center glow-primary">
                <Sparkles className="h-10 w-10 text-primary animate-pulse" />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground">
                Building Your Digital Twin
              </h2>
              <div className="space-y-3">
                {thinkingPhrases.map((phrase, i) => (
                  <motion.div
                    key={phrase}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{
                      opacity: i <= thinkingIdx ? 1 : 0.3,
                      x: 0,
                    }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span
                      className={cn(
                        "text-xs font-mono",
                        i < thinkingIdx
                          ? "text-primary"
                          : i === thinkingIdx
                          ? "text-primary animate-pulse"
                          : "text-muted-foreground"
                      )}
                    >
                      {i < thinkingIdx ? "✓" : i === thinkingIdx ? "▸" : "○"}
                    </span>
                    <span className={cn(
                      i <= thinkingIdx ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {phrase}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Complete */}
      <AnimatePresence>
        {profileComplete && profileData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-lg w-full mx-4 bg-card border border-border rounded-2xl p-8 space-y-6 glow-primary"
            >
              <div className="text-center space-y-3">
                <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  Your Digital Twin is Ready!
                </h2>
                <p className="text-muted-foreground text-sm">
                  Your AI career profile has been built.
                </p>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 space-y-3">
                {profileData.name && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Name</span>
                    <span className="text-foreground font-medium">{renderProfileValue(profileData.name)}</span>
                  </div>
                )}
                {profileData.careerStage && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Career Stage</span>
                    <span className="text-foreground font-medium">{renderProfileValue(profileData.careerStage)}</span>
                  </div>
                )}
                {profileData.province && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Province</span>
                    <span className="text-foreground font-medium">{renderProfileValue(profileData.province)}</span>
                  </div>
                )}
                {profileData.industry && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Industry</span>
                    <span className="text-foreground font-medium">{renderProfileValue(profileData.industry)}</span>
                  </div>
                )}
                {profileData.education && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Education</span>
                    <span className="text-foreground font-medium">{renderProfileValue(profileData.education)}</span>
                  </div>
                )}
                {profileData.skills && profileData.skills.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Skills</span>
                    <span className="text-foreground font-medium text-right">
                      {renderProfileValue(profileData.skills)}
                    </span>
                  </div>
                )}
                {profileData.empowermentScore != null && (
                  <div className="flex justify-between items-center text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground font-medium">Empowerment Score</span>
                    <span className="text-2xl font-display font-bold text-primary">
                      {renderProfileValue(profileData.empowermentScore)}
                      <span className="text-sm text-muted-foreground">/100</span>
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={handleContinueToDashboard}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors"
              >
                Continue to Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-1">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex gap-3 py-3",
                msg.sender === "user" ? "justify-end" : "justify-start"
              )}
            >
              {msg.sender === "ai" && (
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center mt-1">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-[80%] space-y-3",
                  msg.sender === "user" ? "items-end" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-chat-ai text-foreground border border-border/50 rounded-bl-md"
                  )}
                >
                  {msg.sender === "ai" ? (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>

                {/* Options */}
                {msg.sender === "ai" && msg.options && msg.options.length > 0 && msg === lastMessage && !isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-wrap gap-2"
                  >
                    {msg.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleOptionClick(opt)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border border-border/60 bg-secondary/50 hover:border-primary/50 hover:bg-primary/10 text-foreground transition-all group"
                      >
                        {opt}
                        <ChevronRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-primary/30 flex items-center justify-center mt-1">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
            </motion.div>
          ))}

          {/* Typing Indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex gap-3 py-3"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-chat-ai border border-border/50 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-2 w-2 rounded-full bg-primary/60 typing-dot"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-auto max-w-md p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive text-center"
            >
              {error}
            </motion.div>
          )}

          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border bg-card/80 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 bg-muted/50 border border-border rounded-xl px-4 py-2">
            <Sparkles className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(userInput)}
              placeholder={
                hasOptions
                  ? "Or type your own answer..."
                  : "Tell me about your career goals..."
              }
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none py-1"
              disabled={isTyping || showThinking || profileComplete}
            />
            <button
              onClick={() => handleSend(userInput)}
              disabled={!userInput.trim() || isTyping || showThinking}
              className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            AI-powered career insights for the South African job market
          </p>
        </div>
      </div>
    </div>
  );
}