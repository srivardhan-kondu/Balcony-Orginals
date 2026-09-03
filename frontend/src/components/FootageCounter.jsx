"use client";

import { useEffect, useRef } from "react";
import { useSiteChromeVisible } from "@/hooks/use-past-hero";

export const FootageCounter = () => {
  const ref = useRef(null);
  /* The projection hero has its own readout in the same corner — two footage
     counters printed over each other is worse than either. */
  const visible = useSiteChromeVisible();

  useEffect(() => {
    let raf;
    const tick = () => {
      const y = window.scrollY || 0;
      if (ref.current) {
        const frames = String(Math.floor(y * 2.4)).padStart(6, "0");
        const ftg = String(Math.floor(y / 24)).padStart(4, "0");
        ref.current.textContent = `FTG ${ftg} · FR ${frames}`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      data-testid="footage-counter"
      aria-hidden="true"
      className={`pointer-events-none fixed bottom-5 right-[var(--bo-gutter)] z-[70] hidden items-center gap-2.5 font-mono text-[10px] tracking-[0.22em] text-dim transition-opacity duration-500 md:flex ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bone/50" />
      <span ref={ref}>FTG 0000 · FR 000000</span>
      <span>· 24 FPS</span>
    </div>
  );
};
