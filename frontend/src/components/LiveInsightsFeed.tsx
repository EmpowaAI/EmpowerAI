import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Search, Zap, TrendingUp, Target, BarChart3, AlertCircle, MapPin } from "lucide-react";
import { opportunitiesAPI } from "../lib/api";
import { useUser } from "../lib/user-context";

interface Insight {
  id: string;
  icon: React.ElementType;
  text: string;
  type: "detection" | "insight" | "market" | "alert";
}

export default function LiveInsightsFeed() {
  const { user } = useUser();
  const [visibleInsights, setVisibleInsights] = useState<Insight[]>([]);
  const [isTyping, setIsTyping] = useState(true);
  const [insights, setInsights] = useState<Insight[]>([]);
  const idxRef = useRef(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const response = await opportunitiesAPI.getAll({ limit: 5 });
        const opportunities = response?.data?.opportunities || [];
        const total = response?.meta?.totalFiltered ?? opportunities.length;
        const province = user?.province || "your province";

        const nextInsights: Insight[] = [
          {
            id: "market-total",
            icon: BarChart3,
            text: `Market Scan: ${total} live opportunities indexed across South Africa.`,
            type: "market",
          },
          {
            id: "market-province",
            icon: MapPin,
            text: `Local Pulse: Opportunities are available in ${province}. Keep your profile updated for better matches.`,
            type: "market",
          },
        ];

        if (opportunities[0]) {
          nextInsights.push({
            id: "opportunity-highlight",
            icon: AlertCircle,
            text: `Opportunity Spotlight: ${opportunities[0].title} at ${opportunities[0].company || "a leading employer"}.`,
            type: "alert",
          });
        }

        if (user?.skills?.length) {
          nextInsights.push({
            id: "skills-detected",
            icon: Search,
            text: `Detected: ${user.skills.slice(0, 3).join(", ")} are strong signals in current listings.`,
            type: "detection",
          });
        } else {
          nextInsights.push({
            id: "skills-missing",
            icon: Zap,
            text: "Insight: Add your top skills to unlock more accurate opportunity matching.",
            type: "insight",
          });
        }

        setInsights(nextInsights);
      } catch (error) {
        console.error("Failed to load insights:", error);
        setInsights([
          {
            id: "fallback",
            icon: Target,
            text: "Insight feed is warming up. Check back for live market signals.",
            type: "insight",
          },
        ]);
      }
    };

    loadInsights();
  }, [user?.province, user?.skills]);

  useEffect(() => {
    cancelledRef.current = false;
    idxRef.current = 0;
    setVisibleInsights([]);

    const addInsight = () => {
      if (cancelledRef.current) return;
      if (idxRef.current >= insights.length) {
        setIsTyping(false);
        return;
      }
      setIsTyping(true);
      const currentIdx = idxRef.current;
      setTimeout(() => {
        if (cancelledRef.current) return;
        setVisibleInsights((prev) => [...prev, insights[currentIdx]]);
        idxRef.current = currentIdx + 1;
        setIsTyping(false);
        if (currentIdx + 1 < insights.length) {
          setTimeout(addInsight, 2000);
        }
      }, 900);
    };
    const timer = setTimeout(addInsight, 700);
    return () => {
      cancelledRef.current = true;
      clearTimeout(timer);
    };
  }, [insights]);

  const typeColor = {
    detection: "border-neon-orange/30 bg-neon-orange/5",
    insight: "border-primary/30 bg-primary/5",
    market: "border-neon-green/30 bg-neon-green/5",
    alert: "border-secondary/30 bg-secondary/5",
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
          <Brain className="h-5 w-5 text-primary ai-thinking-pulse" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-semibold">Live SA Market Intelligence</h3>
          <p className="text-xs text-muted-foreground">Real-time career intelligence feed — South Africa</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-neon-green animate-pulse" />
          <span className="text-[10px] font-medium text-neon-green uppercase tracking-wider">Live</span>
        </div>
      </div>

      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        <AnimatePresence>
          {visibleInsights.map((insight) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20, height: 0 }}
              animate={{ opacity: 1, x: 0, height: "auto" }}
              transition={{ duration: 0.4 }}
              className={`flex items-start gap-3 p-3 rounded-lg border ${typeColor[insight.type]}`}
            >
              <div className="h-7 w-7 rounded-lg bg-card/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                <insight.icon className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{insight.text}</p>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2 p-3 text-xs text-muted-foreground">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="h-1.5 w-1.5 rounded-full bg-primary" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} />
                ))}
              </div>
              <span>Scanning SA job market...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
