import { motion } from "framer-motion";

interface ScoreMeterProps {
  score: number;
  label: string;
  size?: "sm" | "md" | "lg";
}

export default function ScoreMeter({ score, label, size = "md" }: ScoreMeterProps) {
  const dimensions = { sm: 60, md: 90, lg: 120 };
  const dim = dimensions[size];
  const strokeWidth = size === "sm" ? 4 : size === "md" ? 6 : 8;
  const radius = (dim - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = () => {
    if (score >= 70) return "hsl(var(--sa-green))";
    if (score >= 40) return "hsl(var(--sa-gold))";
    return "hsl(var(--sa-terracotta))";
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2} cy={dim / 2} r={radius}
            fill="none" stroke="hsl(var(--border))" strokeWidth={strokeWidth}
          />
          <motion.circle
            cx={dim / 2} cy={dim / 2} r={radius}
            fill="none" stroke={getColor()} strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 6px ${getColor()}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span 
            className="font-display font-bold"
            style={{ fontSize: size === "sm" ? 14 : size === "md" ? 20 : 28, color: getColor() }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-medium">{label}</span>
    </div>
  );
}
