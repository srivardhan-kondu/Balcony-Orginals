"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import Lenis from "lenis";

/* Everything the old App.js did that only makes sense in a browser, gathered
   into one Client Component so the layout around it can stay on the server.

   The QueryClient is created inside state rather than at module scope: a module
   holding one client is fine for a single browser tab and wrong on a server,
   where every request would share the same cache. This is the shape the React
   Query docs prescribe for exactly that reason, and it costs nothing here. */
export const Providers = ({ children }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    let raf;
    const loop = (t) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* The stylesheet's reduced-motion block can only reach CSS animation and
          transition. Every reveal, masked headline, parallax and card tilt on this
          site is a framer-motion transform, which that block cannot touch —
          `reducedMotion="user"` is what actually holds them still, by making the
          library drop transform and layout animations while keeping opacity, so
          nothing is left invisible mid-reveal. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </QueryClientProvider>
  );
};
