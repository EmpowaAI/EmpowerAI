import { useState } from "react";
import { Bug, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUser } from "@/contexts/user-context";

const SUPPORT_EMAIL = "support@empowa.org";

interface Props {
  trigger?: React.ReactNode;
}

export function BugReportDialog({ trigger }: Props) {
  const { user } = useUser();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[Bug] ${title || "Untitled"}`);
    const body = encodeURIComponent(
      `Reported by: ${user?.name ?? "Guest"} (${user?.email ?? "no email"})

What went wrong:
${details}

---
URL: ${window.location.href}
User agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}`
    );
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
    setOpen(false);
    setTitle("");
    setDetails("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Bug className="mr-1 h-4 w-4" />
            Report a bug
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-primary">
            <Bug className="h-5 w-5 text-secondary" />
            Report a bug
          </DialogTitle>
          <DialogDescription>
            Help us improve EmpowaAI. Your message will open in your email app.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="bug-title">What&apos;s broken?</Label>
            <Input
              id="bug-title"
              required
              placeholder="e.g. CV upload fails on Safari"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bug-details">Steps to reproduce</Label>
            <Textarea
              id="bug-details"
              required
              rows={5}
              placeholder={"1. Went to demo page\n2. Clicked 'Run the demo'\n3. Saw…"}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="cta">
              <Send className="mr-1 h-4 w-4" />
              Send report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
