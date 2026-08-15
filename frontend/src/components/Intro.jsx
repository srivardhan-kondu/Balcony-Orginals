import { useEffect, useRef, useState } from "react";

// The loader owns the screen for roughly the length of the logo animation.
// FALLBACK_MS is the backstop: if the video never fires `ended` — blocked
// autoplay, a codec the browser refuses, a stalled download — the poster
// frame is already on screen, and we hand over the site anyway.
const FALLBACK_MS = 2800;
const ERROR_MS = 1400;
const FADE_MS = 550;

export const Intro = () => {
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
    if (!show) return;

    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const v = vidRef.current;
    if (v && !reduced) v.play().catch(() => {});

    // Reduced motion still gets the mark, just held as a still rather than animated.
    const t = setTimeout(() => end(), reduced ? 1100 : FALLBACK_MS);
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
    }, FADE_MS);
  };

  if (!show) return null;

  return (
    <div
      data-testid="brand-intro"
      role="dialog"
      aria-label="Balcony Originals"
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-black"
      style={{ opacity: fading ? 0 : 1, transition: `opacity ${FADE_MS}ms ease` }}
    >
      {/* The video is letterboxed black on black, so overflowing it on narrow
          screens simply crops empty frame — the mark reads large on a phone
          without needing a separate mobile cut. */}
      <video
        ref={vidRef}
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
        <p className="max-w-[290px] text-center font-mono text-[9.5px] uppercase leading-[2.1] tracking-[0.26em] text-bone/45 sm:max-w-none sm:text-[10.5px] sm:tracking-[0.3em]">
          Stories rooted in culture. Told for the world.
        </p>
      </div>
    </div>
  );
};
