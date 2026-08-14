import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { StatusChip } from "@/components/ProjectCard";

const DOT = 76;

const Panel = ({ p, i, active, onFocus }) => {
  const ref = useRef(null);
  const inCenter = useInView(ref, { margin: "-42% 0px -42% 0px" });
  useEffect(() => {
    if (inCenter) onFocus(i);
  }, [inCenter, i, onFocus]);

  return (
    <div
      ref={ref}
      data-testid={`slate-panel-${p.slug}`}
      data-active={active}
      className="relative flex min-h-[88svh] items-center border-t border-line last:border-b"
    >
      <div
        className={`grid w-full items-center gap-10 py-14 transition-opacity duration-700 lg:grid-cols-[1fr_1.15fr] lg:pl-14 ${
          active ? "opacity-100" : "opacity-25"
        }`}
      >
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-bone/50">
            {p.type === "feature" ? "Feature film" : "Documentary"}
          </div>
          <div className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <span
              className={`font-display text-[clamp(44px,5vw,80px)] font-extrabold leading-none transition-colors duration-700 ${
                active ? "text-bone/30" : "text-bone/15"
              }`}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="font-display text-[clamp(28px,3.6vw,54px)] font-extrabold uppercase leading-[1] tracking-[-0.01em] text-bone">
              {p.title}
            </h3>
          </div>
          <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/50">
            {[p.location, p.state, p.year].filter(Boolean).join(" · ")}
          </div>
          <p className="mt-5 max-w-[46ch] text-[15px] leading-relaxed text-mute">{p.logline}</p>
          <div
            className={`mt-7 flex flex-wrap items-center gap-4 transition-all duration-700 ${
              active ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            <StatusChip status={p.status} />
            <Link
              to={`/projects/${p.slug}`}
              data-testid={`slate-view-${p.slug}`}
              className="group inline-flex items-center gap-2.5 rounded-sm border border-bone/30 px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.2em] text-bone transition-colors duration-300 hover:bg-bone hover:text-ink"
            >
              View project
              <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div
          className={`relative overflow-hidden rounded-sm border transition-all duration-700 ${
            active ? "border-bone/20" : "border-line"
          }`}
          style={{ aspectRatio: "16/9" }}
        >
          <Link to={`/projects/${p.slug}`} tabIndex={-1} aria-label={`Open ${p.title}`}>
            <img
              src={p.hero}
              alt={p.title}
              loading="lazy"
              className={`h-full w-full object-cover transition-all duration-[1200ms] ${
                active ? "scale-100 opacity-100 grayscale-0" : "scale-[1.07] opacity-60 grayscale"
              }`}
            />
          </Link>
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-bone/40" />
          <span aria-hidden="true" className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-bone/40" />
        </div>
      </div>
    </div>
  );
};

export const SlateFocus = ({ projects = [] }) => {
  const [active, setActive] = useState(0);
  if (!projects.length) return null;

  return (
    <div className="relative">
      {/* progress rail */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 -left-2 hidden lg:block">
        <div className="sticky top-[36vh]">
          <div className="relative" style={{ height: (projects.length - 1) * DOT }}>
            <span className="absolute left-[7px] top-0 h-full w-px bg-line" />
            <span
              className="absolute left-[7px] top-0 w-px bg-bone transition-all duration-500"
              style={{ height: active * DOT }}
            />
            {projects.map((p, i) => (
              <span key={p.slug} className="absolute left-0 flex items-center gap-3" style={{ top: i * DOT - 7 }}>
                <span
                  className={`h-[15px] w-[15px] rounded-full border transition-all duration-500 ${
                    i === active ? "border-bone bg-bone" : "border-bone/40 bg-ink"
                  }`}
                />
                <span
                  className={`font-mono text-[10px] tracking-[0.2em] transition-colors duration-500 ${
                    i === active ? "text-bone" : "text-bone/30"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {projects.map((p, i) => (
        <Panel key={p.slug} p={p} i={i} active={active === i} onFocus={setActive} />
      ))}

      <div className="py-10 text-center font-mono text-[9.5px] tracking-[0.3em] text-bone/35">
        FOCUS ON ONE STORY AT A TIME · EVERY STORY DESERVES YOUR ATTENTION
      </div>
    </div>
  );
};
