import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Check, ArrowRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  feature?: string;
}

const PERKS = [
  "Lock in your 5-path career match",
  "Personalised learning roadmap",
  "Mentor & gig matching",
  "Income projections + monthly check-ins",
  "Priority support",
];

export function UpgradeModal({ open, onOpenChange, feature }: Props) {
  const navigate = useNavigate();

  const handleContinue = () => {
    onOpenChange(false);
    toast.success("Create an account to unlock Premium when billing goes live.");
    navigate("/login");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-md">
        <div className="relative bg-ai-gradient px-6 py-7 text-primary-foreground">
          <div className="ai-grid absolute inset-0 opacity-30" aria-hidden />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-sm">
              <Sparkles className="h-3 w-3" />
              Premium
            </span>
            <DialogHeader className="mt-3 space-y-1 text-left">
              <DialogTitle className="font-display text-2xl font-bold leading-tight text-primary-foreground">
                {feature ? `Unlock ${feature}` : "Unlock everything"}
              </DialogTitle>
              <DialogDescription className="text-primary-foreground/85">
                One simple plan. Cancel anytime.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 flex items-baseline gap-1.5">
              <span className="font-display text-4xl font-extrabold">R50</span>
              <span className="text-sm text-primary-foreground/80">/ month</span>
            </div>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <ul className="space-y-2.5">
            {PERKS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span className="text-foreground">{p}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-lg border border-border/70 bg-muted/40 p-3 text-[11px] text-muted-foreground">
            <strong className="text-primary">CV Analyser stays Mahala</strong> — always free, no card needed.
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              <X className="mr-1 h-4 w-4" />
              Not now
            </Button>
            <Button variant="cta" className="shimmer w-full flex-1" onClick={handleContinue}>
              Continue to sign up
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <p className="text-center text-[11px] text-muted-foreground">
            Or{" "}
            <Link
              to="/pricing"
              onClick={() => onOpenChange(false)}
              className="font-semibold text-primary hover:text-secondary"
            >
              compare plans
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
