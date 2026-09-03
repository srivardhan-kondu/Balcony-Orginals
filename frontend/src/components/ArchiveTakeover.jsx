"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion";
import { ArrowUpRight, Volume2, VolumeX } from "lucide-react";
import { STATUS_LABELS } from "@/lib/api";
import { isSoundEnabled, setSoundEnabled, subscribeSound } from "@/lib/sound";

const Panel = ({ p, i, n, progress }) => {
  const seg = 1 / n;
  const start = i * seg;
  const wipe = useTransform(progress, [start, start + seg * 0.55], ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]);
  const imgScale = useTransform(progress, [start, start + seg], [1.18, 1]);
  const textY = useTransform(progress, [start, start + seg * 0.5], [70, 0]);
  const textOp = useTransform(progress, [start, start + seg * 0.4], [0, 1]);

  return (
    <motion.div
      data-testid={`takeover-panel-${p.slug}`}
      className="absolute inset-0"
      style={{ clipPath: i === 0 ? "inset(0% 0% 0% 0%)" : wipe, zIndex: i + 1 }}
    >
      <motion.img
        src={p.hero}
        alt={p.title}
        style={{ scale: imgScale }}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/40" />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[1560px] px-[clamp(18px,4vw,58px)] pb-[clamp(36px,7vh,80px)]">
        <motion.div style={{ y: textY, opacity: textOp }}>
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-bone/60">
            {`${p.type === "feature" ? "Feature film" : "Documentary"} · ${STATUS_LABELS[p.status] || p.status}`}
          </div>
          <h3 className="mt-3 font-display text-[clamp(34px,6vw,92px)] font-extrabold uppercase leading-[0.96] tracking-[-0.02em] text-bone">
            {p.title}
          </h3>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed text-bone/70">{p.logline}</p>
          <Link
            href={`/projects/${p.slug}`}
            data-testid={`takeover-view-${p.slug}`}
            className="group mt-7 inline-flex items-center gap-2.5 rounded-sm border border-bone/35 px-6 py-3.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-bone transition-colors duration-300 hover:bg-bone hover:text-ink"
          >
            View project
            <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export const ArchiveTakeover = ({ projects = [] }) => {
  const ref = useRef(null);
  const n = projects.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [idx, setIdx] = useState(0);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  useMotionValueEvent(scrollYProgress, "change", (v) =>
    setIdx(Math.min(n - 1, Math.max(0, Math.floor(v * n))))
  );
  useEffect(() => subscribeSound(setSoundOn), []);

  if (!n) return null;

  return (
    <section
      ref={ref}
      data-testid="archive-takeover"
      className="relative border-t border-line"
      style={{ height: `${n * 110}svh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {projects.map((p, i) => (
          <Panel key={p.slug} p={p} i={i} n={n} progress={scrollYProgress} />
        ))}

        {/* chrome */}
        <div className="absolute inset-x-0 top-0 z-[60] mx-auto flex w-full max-w-[1560px] items-center justify-between px-[clamp(18px,4vw,58px)] pt-[clamp(84px,10vh,110px)]">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rotate-45 bg-bone" />
            <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-bone/70">
              The archive · scroll through the stories
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span data-testid="takeover-counter" className="font-mono text-[11px] tracking-[0.3em] text-bone/70">
              {String(idx + 1).padStart(2, "0")} / {String(n).padStart(2, "0")}
            </span>
            <button
              data-testid="archive-sound-toggle"
              onClick={() => setSoundEnabled(!soundOn)}
              aria-pressed={soundOn}
              aria-label={soundOn ? "Mute interface sound" : "Enable interface sound"}
              className="inline-flex items-center gap-2 rounded-sm border border-bone/25 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-bone/60 transition-colors duration-300 hover:border-bone/60 hover:text-bone"
            >
              {soundOn ? <Volume2 size={11} /> : <VolumeX size={11} />}
              Sound
            </button>
          </div>
        </div>

        {/* progress rail */}
        <div className="absolute right-[clamp(18px,4vw,58px)] top-1/2 z-[60] hidden -translate-y-1/2 flex-col gap-3 md:flex">
          {projects.map((p, i) => (
            <span
              key={p.slug}
              className={`w-px transition-all duration-500 ${i === idx ? "h-10 bg-bone" : "h-6 bg-bone/25"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
