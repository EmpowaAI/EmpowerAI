import { useState } from "react";
import { MessageCircle, X, Mail, Bug, HelpCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { BugReportDialog } from "@/components/BugReportDialog";

const SUPPORT_EMAIL = "support@empowa.org";

export function ContactWidget() {
  const [open, setOpen] = useState(false);

  const mailto = (subject: string) => `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;

  return (
    <div className="fixed bottom-20 right-4 z-50 sm:bottom-6 sm:right-6">
      {open && (
        <Card className="mb-3 w-[calc(100vw-2rem)] max-w-sm overflow-hidden border-border/70 bg-card p-0 shadow-glow animate-fade-up">
          <div className="flex items-center justify-between gap-2 bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <span className="ai-dot" aria-hidden />
              <div>
                <div className="font-display text-sm font-bold">We&apos;re here, sawubona 👋</div>
                <div className="text-[11px] text-primary-foreground/80">Replies within 1 business day</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close contact panel"
              className="rounded-full p-1 transition-colors hover:bg-primary-foreground/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2 p-4">
            <a
              href={mailto("Question about EmpowaAI")}
              className="flex items-start gap-3 rounded-xl border border-border/70 bg-background p-3 text-left transition-smooth hover:-translate-y-0.5 hover:border-secondary/60 hover:shadow-card-soft"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                <HelpCircle className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-semibold text-primary">Ask a question</div>
                <div className="text-xs text-muted-foreground">
                  Talk to a human about your career path or pricing.
                </div>
              </div>
            </a>

            <a
              href={mailto("EmpowaAI feedback")}
              className="flex items-start gap-3 rounded-xl border border-border/70 bg-background p-3 text-left transition-smooth hover:-translate-y-0.5 hover:border-secondary/60 hover:shadow-card-soft"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-semibold text-primary">Share feedback</div>
                <div className="text-xs text-muted-foreground">Tell us what&apos;s working — and what&apos;s not.</div>
              </div>
            </a>

            <BugReportDialog
              trigger={
                <button
                  type="button"
                  className="flex w-full items-start gap-3 rounded-xl border border-border/70 bg-background p-3 text-left transition-smooth hover:-translate-y-0.5 hover:border-secondary/60 hover:shadow-card-soft"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                    <Bug className="h-4 w-4" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-primary">Report a bug</div>
                    <div className="text-xs text-muted-foreground">Found something broken? Tell us what.</div>
                  </div>
                </button>
              }
            />
          </div>

          <div className="flex items-center justify-between border-t border-border/60 bg-muted/40 px-4 py-2.5 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Mail className="h-3 w-3" /> {SUPPORT_EMAIL}
            </span>
            <span>POPIA compliant</span>
          </div>
        </Card>
      )}

      <Button
        variant="cta"
        size="lg"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close help" : "Open help"}
        aria-expanded={open}
        className="h-12 w-12 rounded-full p-0 shadow-glow sm:h-14 sm:w-14"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </Button>
    </div>
  );
}
