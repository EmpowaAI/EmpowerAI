import { Link, useNavigate } from "react-router-dom";
import { LogOut, CreditCard, Bug, User as UserIcon, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/user-context";
import { authService } from "@/api/Index";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";

const SUPPORT_EMAIL = "support@empowa.org";

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

export function ProfileMenu() {
  const { user, logout: contextLogout } = useUser();
  const navigate = useNavigate();
  const [bugOpen, setBugOpen] = useState(false);
  const [bugTitle, setBugTitle] = useState("");
  const [bugDetails, setBugDetails] = useState("");

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // proceed with local cleanup
    }
    contextLogout();
    toast.success("Signed out. Sala kahle.");
    navigate("/", { replace: true });
  }, [contextLogout, navigate]);

  if (!user) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <Button asChild variant="outline" size="sm">
          <Link to="/login">Sign In</Link>
        </Button>
      </div>
    );
  }

  const initials = initialsOf(user.name);

  const submitBug = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[Bug] ${bugTitle || "Untitled"}`);
    const body = encodeURIComponent(
      `Reported by: ${user.name} (${user.email})

What went wrong:
${bugDetails}

---
URL: ${window.location.href}
User agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}`
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setBugOpen(false);
    setBugTitle("");
    setBugDetails("");
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Open profile menu"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground shadow-card-soft transition-smooth hover:scale-105 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {initials}
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {initials}
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-primary">{user.name}</div>
              <div className="text-[11px] text-muted-foreground">{user.email}</div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link to="/pricing" className="cursor-pointer">
              <CreditCard className="mr-2 h-4 w-4" />
              Pricing
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <Link to="/dashboard" className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              My dashboard
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              setBugOpen(true);
            }}
          >
            <Bug className="mr-2 h-4 w-4" />
            Report a bug
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => void handleLogout()}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={bugOpen} onOpenChange={setBugOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-primary">
              <Bug className="h-5 w-5 text-secondary" />
              Report a bug
            </DialogTitle>
            <DialogDescription>
              Help us improve EmpowAI. Your message will open in your email app.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitBug} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="profile-bug-title">What&apos;s broken?</Label>
              <Input
                id="profile-bug-title"
                required
                placeholder="e.g. CV upload fails on Safari"
                value={bugTitle}
                onChange={(e) => setBugTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="profile-bug-details">Steps to reproduce</Label>
              <Textarea
                id="profile-bug-details"
                required
                rows={5}
                placeholder={"1. Went to demo page\n2. Clicked 'Run the demo'\n3. Saw…"}
                value={bugDetails}
                onChange={(e) => setBugDetails(e.target.value)}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" onClick={() => setBugOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="cta">
                <Sparkles className="mr-1 h-4 w-4" />
                Send report
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
