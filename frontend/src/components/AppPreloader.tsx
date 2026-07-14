import { useEffect, useState } from "react";

// Served straight from /public — Vite copies it to the build root as-is.
// (public assets must be referenced by URL, not `import`ed, or the path 404s.)
const logo = "/images/empowerLogo.jpg";

const AppPreloader = () => {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const minShowTimer = window.setTimeout(() => setLeaving(true), 900);
    const removeTimer = window.setTimeout(() => setVisible(false), 1250);

    return () => {
      window.clearTimeout(minShowTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-300 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading EmpowaAI"
    >
      <div className="flex flex-col items-center gap-5 animate-scale-in">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-border" />
          <div className="absolute inset-2 rounded-full border-2 border-secondary border-t-transparent animate-spin" />

          <img
            src={logo}
            alt="EmpowaAI logo"
            className="h-14 w-14 rounded-md object-cover shadow-card-soft"
            width={56}
            height={56}
            decoding="async"
          />
        </div>

        <div className="text-center">
          <p className="font-display text-2xl font-semibold text-foreground">
            EmpowaAI
          </p>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            Preparing your career intelligence
          </p>
        </div>
      </div>
    </div>
  );
};

export default AppPreloader;
