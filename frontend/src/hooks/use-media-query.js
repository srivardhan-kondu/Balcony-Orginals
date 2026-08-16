import { useEffect, useState } from "react";

/**
 * Subscribe to a media query.
 *
 * The point of using this over a `hidden lg:block` class is *mounting*. Several
 * decorations on this site are WebGL scenes: hiding one in CSS still builds the
 * context, uploads the geometry and runs its rAF loop, on the phones least able
 * to spare any of it. Gate the JSX on this instead and the scene never exists.
 */
export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
};

/** Matches Tailwind's `lg` — the width at which the desktop-only scenes appear. */
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
