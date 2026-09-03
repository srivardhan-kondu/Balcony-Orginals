"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribe to a media query.
 *
 * The point of using this over a `hidden lg:block` class is *mounting*. Several
 * decorations on this site are WebGL scenes: hiding one in CSS still builds the
 * context, uploads the geometry and runs its rAF loop, on the phones least able
 * to spare any of it. Gate the JSX on this instead and the scene never exists.
 *
 * `useSyncExternalStore` rather than the `useState` + `useEffect` pair this used
 * to be, and the third argument is the whole reason. Every page is prerendered
 * now, and the server has no viewport to measure — so the old initialiser,
 * which read `window.matchMedia` behind a `typeof window` guard, returned false
 * on the server and true in a desktop browser. React compares the two during
 * hydration and treats the difference as a bug, because it usually is one.
 *
 * Stating the server's answer explicitly makes it not a bug: there is no
 * viewport during a prerender, `false` is the honest answer, and the real one
 * arrives on the first client render. Nothing gated on this is visible in that
 * frame — the WebGL scenes are decoration, and the projection hero's nav is
 * still behind the splash when the swap happens.
 */
export const useMediaQuery = (query) => {
  const subscribe = useCallback(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
};

/** Matches Tailwind's `lg` — the width at which the desktop-only scenes appear. */
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");

/** The reader's motion preference, on the same footing as any other query. */
export const usePrefersReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
