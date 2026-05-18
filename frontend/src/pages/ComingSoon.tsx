import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { API_BASE_URL } from "../lib/apiBase";

const FEATURES = [
  "AI-powered CV analysis with real improvement advice",
  "Digital Twin that maps your career market value",
  "Matched South African jobs, learnerships & bursaries",
  "Interview coaching built around your actual experience",
];

export default function ComingSoon() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch(`${API_BASE_URL}/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      if (!res.ok && res.status !== 409) throw new Error("Failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <Logo variant="default" size="md" linkTo="/" />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            to="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-2xl text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-wider">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Launching soon
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
              Your career breakthrough
              <br />
              <span className="text-primary">starts here.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              EmpowaAI turns your CV into a full career strategy — matched
              opportunities, income projections, and interview coaching, built
              for South Africa.
            </p>
          </div>

          {/* Features */}
          <ul className="text-left space-y-3 max-w-md mx-auto">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {/* Waitlist form */}
          {status === "success" ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <CheckCircle2 className="h-10 w-10 text-primary" />
              <p className="font-semibold text-foreground">You're on the list!</p>
              <p className="text-sm text-muted-foreground">
                We'll email you the moment we open access.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <div className="flex-1">
                <label htmlFor="waitlist-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg("");
                    if (status === "error") setStatus("idle");
                  }}
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 shrink-0"
              >
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Join waitlist
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {errorMsg && (
            <p className="text-sm text-destructive -mt-4">{errorMsg}</p>
          )}

          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline underline-offset-2 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} EmpowaAI. Built for South Africa.
      </footer>
    </div>
  );
}
