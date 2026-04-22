import { useEffect, useRef, useState } from "react";

/**
 * useReveal — IntersectionObserver hook that adds a "revealed" state once
 * the element enters the viewport. Respects prefers-reduced-motion by
 * resolving immediately so content is never hidden.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: IntersectionObserverInit = { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
) {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setRevealed(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRevealed(true);
        io.disconnect();
      }
    }, options);
    io.observe(node);
    return () => io.disconnect();
  }, [options]);

  return { ref, revealed };
}