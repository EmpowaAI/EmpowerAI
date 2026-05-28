import { ReactNode, useState } from "react";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UpgradeModal } from "@/components/UpgradeModal";

interface PremiumGateProps {
  children?: ReactNode;
  feature?: string;
  inline?: boolean;
  force?: boolean;
}

/**
 * Presentational premium gate — unlock flow routes to login/pricing (no mock auth).
 */
export function PremiumGate({ children, feature, inline, force }: PremiumGateProps) {
  const [open, setOpen] = useState(false);
  const isPremium = false;

  if (isPremium && !force) return <>{children}</>;

  if (inline) {
    return (
      <>
        <Button variant="cta" size="sm" onClick={() => setOpen(true)} className="shimmer">
          <Sparkles className="mr-1 h-4 w-4" />
          Unlock for R50/mo
        </Button>
        <UpgradeModal open={open} onOpenChange={setOpen} feature={feature} />
      </>
    );
  }

  return (
    <>
      <div className="relative isolate overflow-hidden rounded-2xl">
        <div aria-hidden className="pointer-events-none select-none blur-[6px] saturate-50">
          {children}
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/65 p-6 text-center backdrop-blur-sm">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow">
            <Lock className="h-5 w-5" />
          </span>
          <div className="max-w-xs">
            <h3 className="font-display text-lg font-bold text-primary">
              {feature ? `${feature} is Premium` : "Premium feature"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Unlock all tools — CV Analyser stays free forever.
            </p>
          </div>
          <Button variant="cta" className="shimmer" onClick={() => setOpen(true)}>
            <Sparkles className="mr-1 h-4 w-4" />
            Upgrade for R50/mo
          </Button>
          <span className="text-[11px] text-muted-foreground">Cancel anytime</span>
        </div>
      </div>
      <UpgradeModal open={open} onOpenChange={setOpen} feature={feature} />
    </>
  );
}
