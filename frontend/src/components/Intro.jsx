import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { EASE } from "@/components/Motion";

const Corner = ({ pos }) => (
  <span aria-hidden="true" className={`absolute h-[38px] w-[38px] border-gold/50 ${pos}`} />
);

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
    document.documentElement.style.overflow = "hidden";
    const v = vidRef.current;
    if (v) v.play().catch(() => {});
    const hardT = setTimeout(() => end(), 10000);
    const onKey = (e) => {
      if (e.key === "Escape") end();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(hardT);
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
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
    }, 800);
  };

  if (!show) return null;

  return (
    <div
      data-testid="brand-intro"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-ink transition-opacity duration-700"
      style={{ opacity: fading ? 0 : 1 }}
      role="dialog"
      aria-label="Balcony Originals brand intro"
    >
      <Corner pos="left-[26px] top-[26px] border-l border-t" />
      <Corner pos="right-[26px] top-[26px] border-r border-t" />
      <Corner pos="left-[26px] bottom-[26px] border-l border-b" />
      <Corner pos="right-[26px] bottom-[26px] border-r border-b" />

      <div className="absolute inset-x-0 top-0 h-px bg-bone/10" />

      <div className="relative flex flex-col items-center gap-[clamp(18px,4vh,42px)] px-6">
        <video
          ref={vidRef}
          src="/assets/balcony-intro.mp4"
          poster="/assets/intro-poster.jpg"
          muted
          playsInline
          preload="auto"
          onEnded={end}
          onError={() => setTimeout(() => end(), 1200)}
          className="block max-h-[62vh] w-[min(74vw,860px)]"
          style={{ filter: "invert(1) brightness(.97) contrast(1.9)", mixBlendMode: "screen" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 1.6, ease: EASE }}
          className="text-center font-serif text-[clamp(17px,2.1vw,29px)] leading-[1.35] text-bone"
        >
          Stories rooted in culture.
          <br />
          <span className="text-sand">Told for the world.</span>
        </motion.div>
      </div>

      <div className="absolute bottom-[clamp(30px,5vh,54px)] left-[clamp(26px,4vw,58px)] font-mono text-[10.5px] leading-[1.9] tracking-[0.2em] text-bone/40">
        BALCONY ORIGINALS
        <br />
        PRODUCTION HOUSE · RAYALASEEMA
      </div>

      <button
        data-testid="intro-skip-btn"
        onClick={end}
        className="absolute right-[clamp(26px,4vw,58px)] top-[clamp(64px,9vh,92px)] inline-flex items-center gap-2.5 rounded-sm border border-bone/20 bg-ink/50 px-4 py-2.5 text-[11px] uppercase tracking-[0.16em] text-bone/70 transition-colors duration-300 hover:border-bone hover:text-bone"
      >
        Skip intro
        <span className="font-mono text-[10px] tracking-normal opacity-50">ESC</span>
      </button>
    </div>
  );
};
