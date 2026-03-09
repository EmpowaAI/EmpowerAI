import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Search, Zap, TrendingUp, Target, BarChart3, AlertCircle, MapPin, GraduationCap } from "lucide-react";

interface Insight {
  id: string;
  icon: React.ElementType;
  text: string;
  type: "detection" | "insight" | "market" | "alert";
}

const allInsights: Insight[] = [
  { id: "1", icon: Search, text: "Detected: Your CV lacks 'customer service' keywords — appearing in 90% of SA retail job listings.", type: "detection" },
  { id: "2", icon: Zap, text: "Insight: Rewrite your job descriptions using action verbs to boost recruiter interest by 32%.", type: "insight" },
  { id: "3", icon: MapPin, text: "Market Scan: 12 new admin roles found in Gauteng in the last hour.", type: "market" },
  { id: "4", icon: GraduationCap, text: "Learnership Alert: 5 new learnerships posted in Western Cape — applications close Friday.", type: "alert" },
  { id: "5", icon: BarChart3, text: "Adding 'Sage Accounting' to your CV could increase your match rate by 23% for admin roles.", type: "insight" },
  { id: "6", icon: TrendingUp, text: "Market Alert: Retail hiring in KZN is up 15% ahead of festive season.", type: "market" },
  { id: "7", icon: AlertCircle, text: "Opportunity: New graduate programme at Multichoice in Randburg — matches your profile.", type: "alert" },
  { id: "8", icon: Target, text: "SA employers require driver's licences in 60% of admin listings — update your CV if applicable.", type: "detection" },
];

export default function LiveInsightsFeed() {
  const [visibleInsights, setVisibleInsights] = useState<Insight[]>([]);
  const [isTyping, setIsTyping] = useState(true);
  const idxRef = useRef(0);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    const addInsight = () => {
      if (cancelledRef.current) return;
      if (idxRef.current >= allInsights.length) {
        setIsTyping(false);
        return;
      }
      setIsTyping(true);
      const currentIdx = idxRef.current;
      setTimeout(() => {
        if (cancelledRef.current) return;
        setVisibleInsights((prev) => [...prev, allInsights[currentIdx]]);
        idxRef.current = currentIdx + 1;
        setIsTyping(false);
        if (currentIdx + 1 < allInsights.length) {
          setTimeout(addInsight, 2000);
        }
      }, 1200);
    };
    const timer = setTimeout(addInsight, 1000);
    return () => { cancelledRef.current = true; clearTimeout(timer); };
  }, []);

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
