import { motion } from "framer-motion";

interface ScoreMeterProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export default function ScoreMeter({ score, label = "Score", size = "md" }: ScoreMeterProps) {
  const sizes = {
    sm: { dim: 80, stroke: 6, fontSize: "text-lg", labelSize: "text-[10px]" },
    md: { dim: 120, stroke: 8, fontSize: "text-2xl", labelSize: "text-xs" },
    lg: { dim: 160, stroke: 10, fontSize: "text-4xl", labelSize: "text-sm" },
  };

  const { dim, stroke, fontSize, labelSize } = sizes[size];
  const radius = (dim - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return "hsl(var(--cv-success))";
    if (score >= 60) return "hsl(var(--cv-gold))";
    return "hsl(var(--destructive))";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={dim / 2}
            cy={dim / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`${fontSize} font-display font-bold`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className={`${labelSize} text-muted-foreground`}>{label}</span>
        </div>
      </div>
    </div>
  );
}
