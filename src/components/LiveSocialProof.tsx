import { useEffect, useState } from "react";
import { TrendingUp, Users, MapPin, Briefcase } from "lucide-react";

const FEED = [
  { icon: Briefcase, text: "Thabo from Soweto matched with a junior dev role", time: "2m ago" },
  { icon: TrendingUp, text: "Lerato just hit R8,500/mo — up from R0", time: "5m ago" },
  { icon: Users, text: "Sipho upgraded to Premium", time: "7m ago" },
  { icon: MapPin, text: "New mentor joined in Polokwane", time: "11m ago" },
  { icon: Briefcase, text: "Naledi started her own spaza shop", time: "14m ago" },
  { icon: TrendingUp, text: "Empowerment Score average rose to 71", time: "18m ago" },
];

export const LiveSocialProof = () => {
  const [count, setCount] = useState(12847);
  const [feedIdx, setFeedIdx] = useState(0);

  useEffect(() => {
    const t1 = setInterval(() => setCount((c) => c + Math.floor(Math.random() * 3) + 1), 4000);
    const t2 = setInterval(() => setFeedIdx((i) => (i + 1) % FEED.length), 3500);
    return () => {
      clearInterval(t1);
      clearInterval(t2);
    };
  }, []);

  const item = FEED[feedIdx];
  const Icon = item.icon;

  return (
    <div className="border-y border-border bg-card/50 backdrop-blur-sm">
      <div className="container flex flex-col items-center justify-between gap-3 py-3 text-sm md:flex-row">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-secondary" />
          </span>
          <span className="tabular-nums">{count.toLocaleString()}</span>
          <span className="font-normal text-muted-foreground">South Africans matched this month</span>
        </div>

        <div
          key={feedIdx}
          className="flex animate-fade-in items-center gap-2 text-xs text-muted-foreground"
        >
          <Icon className="h-3.5 w-3.5 text-secondary" />
          <span>{item.text}</span>
          <span className="opacity-60">· {item.time}</span>
        </div>
      </div>
    </div>
  );
};
