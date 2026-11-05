/* ---------------------------------------------------------------------------
   Launch-ceremony mode.

   Open the site with `?launch` (or `?launch=10` for a ten-second countdown) and
   it opens on a premiere screen with a single LAUNCH button instead of the
   usual splash. Ordinary visitors never see it. Several components need to
   know whether it is on — the splash stands aside for it, and the projection
   hero waits for it — so the question is asked in one place.

   Browser-only: pages are prerendered, so this must only be read in an effect.
   --------------------------------------------------------------------------- */

export const LAUNCH_PARAM = "launch";

const DEFAULT_COUNT = 5;

export const isLaunchRequested = () => {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).has(LAUNCH_PARAM);
};

/** Countdown length in seconds, from `?launch=N`, kept between 3 and 10. */
export const launchCount = () => {
  if (typeof window === "undefined") return DEFAULT_COUNT;
  const n = parseInt(new URLSearchParams(window.location.search).get(LAUNCH_PARAM), 10);
  if (!Number.isFinite(n)) return DEFAULT_COUNT;
  return Math.min(10, Math.max(3, n));
};
