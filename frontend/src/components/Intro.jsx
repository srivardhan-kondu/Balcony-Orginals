import { useEffect, useRef, useState } from "react";

/* How long the loader holds the screen. The film itself runs 2.33s, so it is
   played faster rather than cut: a hard stop would leave the wordmark half
   assembled, where a rate change lands the same finished frame, sooner.

   Derived from the video's own duration at runtime rather than a hardcoded
   rate, so re-exporting the film at a different length still lands here. */
const SPLASH_MS = 1500;

// FALLBACK_MS is the backstop: if the video never fires `ended` — blocked
// autoplay, a codec the browser refuses, a stalled download — the poster
// frame is already on screen, and we hand over the site anyway.
const FALLBACK_MS = SPLASH_MS + 400;
const ERROR_MS = 900;
const FADE_MS = 400;
// Reduced motion holds the poster instead of playing anything, and does not
// need the full beat to do it.
const REDUCED_MS = 900;

/* The splash owns the screen for its first two seconds. Anything that opens
   with a timed sequence of its own — the projection hero — has to wait for it,
   or it plays to a covered screen and is over before anyone sees it. Fired once
   the splash has faded, and immediately on visits where it never shows. */
export const INTRO_DONE = "bo:intro-done";

/* The event fires exactly once per page load, but the hero mounts every time
   the reader arrives at `/` — including on the way back from another route,
   long after the splash is done. A latch as well as an event, so a component
   that was not listening at the time can still ask. */
let played = false;
export const hasIntroPlayed = () => played;

const announce = () => {
  played = true;
  window.dispatchEvent(new Event(INTRO_DONE));
};

/** Play the film at whatever rate makes it finish in SPLASH_MS. */
const fitToBeat = (video) => {
  const seconds = video?.duration;
  if (!seconds || !Number.isFinite(seconds)) return;
  // Clamped: a corrupt or oddly short duration should not send the rate
  // somewhere the browser refuses to play at.
  video.playbackRate = Math.min(4, Math.max(0.5, seconds / (SPLASH_MS / 1000)));
};

export const Intro = () => {
  /* The loader, on every route including home: splash.mp4 holds the screen,
     fades, and only then does the page underneath begin. On home that page is
     the projection hero, which starts from black — so the hand-off reads as
     one continuous entrance rather than two competing intros.
     Once per session, as before. */
  const [show, setShow] = useState(() => {
    try {
      return !sessionStorage.getItem("bo-intro-seen");
    } catch {
      return false;
    }
  });
  const [fading, setFading] = useState(false);
  const vidRef = useRef(null);
  const ended = useRef(false);

  useEffect(() => {
    if (!show) {
      // Second visit onward: nothing is covering the page, so release at once.
      announce();
      return;
    }

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const v = vidRef.current;
    if (v && !reduced) {
      fitToBeat(v);
      v.play().catch(() => {});
    }

    // Reduced motion still gets the mark, just held as a still rather than animated.
    const t = setTimeout(() => end(), reduced ? REDUCED_MS : FALLBACK_MS);
    const onKey = (e) => e.key === "Escape" && end();
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const end = () => {
    if (ended.current) return;
    ended.current = true;
    setFading(true);
    try {
      sessionStorage.setItem("bo-intro-seen", "1");
    } catch {}
    setTimeout(() => {
      setShow(false);
      document.documentElement.style.overflow = "";
      announce();
    }, FADE_MS);
  };

  if (!show) return null;

  // bo-dark: the splash is a black-letterboxed brand film, so it plays the same
  // in both themes rather than flipping with the page.
  return (
    <div
      data-testid="brand-intro"
      role="dialog"
      aria-label="Balcony Originals"
      className="bo-dark fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-black"
      style={{ opacity: fading ? 0 : 1, transition: `opacity ${FADE_MS}ms ease` }}
    >
      {/* The video is letterboxed black on black, so overflowing it on narrow
          screens simply crops empty frame — the mark reads large on a phone
          without needing a separate mobile cut. */}
      <video
        ref={vidRef}
        onLoadedMetadata={(e) => fitToBeat(e.currentTarget)}
        src="/assets/splash.mp4"
        poster="/assets/splash-poster.jpg"
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        onEnded={end}
        onError={() => setTimeout(end, ERROR_MS)}
        className="w-[150vw] max-h-[62vh] max-w-none shrink-0 object-contain sm:w-[min(86vw,720px)]"
      />

      <div className="mt-[clamp(14px,3vh,30px)] flex flex-col items-center gap-[clamp(12px,2.4vh,20px)] px-8">
        <span aria-hidden="true" className="h-px w-[52px] bg-bone/25" />
        <p className="max-w-[290px] text-center font-mono text-[10px] uppercase leading-[2.1] tracking-[0.26em] text-mute sm:max-w-none sm:text-[10.5px] sm:tracking-[0.3em]">
          Stories rooted in culture. Told for the world.
        </p>
      </div>
    </div>
  );
};
