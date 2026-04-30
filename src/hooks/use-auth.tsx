import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

/**
 * Frontend-only mock auth.
 * Replace the persistence layer + login/upgrade calls with real backend later (Paystack/Yoco).
 */

export type User = {
  id: string;
  name: string;
  email: string;
  isPremium: boolean;
};

type AuthContextValue = {
  user: User | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  login: (name: string, email: string) => void;
  logout: (opts?: { silent?: boolean; redirectTo?: string }) => void;
  upgrade: () => void; // mock — flip premium flag
};

const STORAGE_KEY = "empowai.user";
const IDLE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes — soft logout

const AuthContext = createContext<AuthContextValue | null>(null);

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();
  const location = useLocation();
  const idleTimer = useRef<number | null>(null);

  const persist = (u: User | null) => {
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const logout = useCallback<AuthContextValue["logout"]>((opts) => {
    setUser(null);
    persist(null);
    if (!opts?.silent) {
      toast({ title: "Signed out", description: "Sala kahle — see you soon." });
    }
    // Soft redirect: only if currently on a protected-feeling page
    const redirectTo = opts?.redirectTo ?? "/";
    if (location.pathname !== redirectTo) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, location.pathname]);

  const login = useCallback<AuthContextValue["login"]>((name, email) => {
    const u: User = {
      id: crypto.randomUUID(),
      name,
      email,
      isPremium: false,
    };
    setUser(u);
    persist(u);
    toast({ title: `Sawubona, ${name.split(" ")[0]}!`, description: "You're signed in." });
  }, []);

  const upgrade = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, isPremium: true };
      persist(next);
      return next;
    });
    toast({
      title: "Welcome to Premium 🎉",
      description: "All tools unlocked. Halala!",
    });
  }, []);

  // Idle / soft logout timer
  useEffect(() => {
    if (!user) return;

    const reset = () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      idleTimer.current = window.setTimeout(() => {
        toast({
          title: "Signed out for security",
          description: "You've been inactive for a while.",
        });
        logout({ silent: true, redirectTo: "/" });
      }, IDLE_LIMIT_MS);
    };

    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [user, logout]);

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setUser(e.newValue ? (JSON.parse(e.newValue) as User) : null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isPremium: !!user?.isPremium,
        login,
        logout,
        upgrade,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const initialsOf = getInitials;
