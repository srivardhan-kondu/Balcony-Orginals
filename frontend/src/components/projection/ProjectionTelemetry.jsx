import { T, at, anim } from "@/lib/projection-timeline";

/* The projectionist's readout along the bottom of the frame. Decorative — it
   reports the state of a machine that does not exist — so it is hidden from
   assistive tech rather than read out. */

export const ProjectionTelemetry = () => (
  <div
    data-anim="tel"
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-0 bottom-[clamp(26px,4vh,44px)] z-[2] flex items-center justify-between gap-4 px-[clamp(24px,5vw,72px)] font-mono text-[clamp(9px,.95vw,11px)] tracking-[0.26em] opacity-0"
    style={{ color: "#616161", ...anim(`bp-fade 1.2s ease ${at(T.telemetry)} both`) }}
  >
    <span className="flex items-center gap-3">
      <span style={anim("bp-breathe 3.4s ease-in-out infinite")}>PROJECTING</span>
      {/* The shutter reading is the expendable half of the line — below ~560px
          the two halves met in the middle and wrapped into each other. */}
      <span className="hidden h-px w-[clamp(18px,3vw,46px)] sm:block" style={{ background: "#2b2b2b" }} />
      <span className="hidden whitespace-nowrap sm:inline">SHUTTER 1/48</span>
    </span>
    <span className="flex items-center gap-3">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: "#ec3013", ...anim("bp-blink 1.1s steps(1,end) infinite") }}
      />
      <span className="whitespace-nowrap">FTG 0000 · 24 FPS</span>
    </span>
  </div>
);

/** The four corner ticks that frame the projected image. */
export const ProjectionFrame = () => (
  <div
    data-anim="frame"
    aria-hidden="true"
    className="pointer-events-none absolute inset-x-[clamp(14px,2.4vw,40px)] bottom-[clamp(28px,4vh,40px)] top-[clamp(64px,9vh,108px)] opacity-0"
    style={anim(`bp-fade 1.2s ease ${at(T.frame)} both`)}
  >
    <span className="absolute left-0 top-0 h-[26px] w-[26px] border-l border-t" style={{ borderColor: "#2a2a2a" }} />
    <span className="absolute right-0 top-0 h-[26px] w-[26px] border-r border-t" style={{ borderColor: "#2a2a2a" }} />
    <span className="absolute bottom-0 left-0 h-[26px] w-[26px] border-b border-l" style={{ borderColor: "#2a2a2a" }} />
    <span className="absolute bottom-0 right-0 h-[26px] w-[26px] border-b border-r" style={{ borderColor: "#2a2a2a" }} />
  </div>
);
