"use client";

import { forwardRef } from "react";
import { T, at, anim } from "@/lib/projection-timeline";

/* The brand mark doubles as the lamp: the B glows, the reel inside its lower
   bowl turns, and the beam is aimed at the bottom edge of this box — which is
   why the stage measures it rather than assuming a height. */

const SPOKES = [0, 90, 180, 270];

export const LampMark = forwardRef(({ label = true }, ref) => (
  <div
    data-anim="lamp"
    className="flex flex-col items-center gap-2.5 justify-self-center opacity-0"
    style={anim(`bp-lamp .7s cubic-bezier(.2,.9,.25,1) ${at(T.lamp)} both`)}
  >
    <div ref={ref} className="relative grid h-[46px] w-[46px] place-items-center">
      {/* the halo around the lamp housing */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[52%] h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "radial-gradient(closest-side, rgba(226,229,232,.3), rgba(200,205,210,.09) 46%, rgba(0,0,0,0) 100%)",
        }}
      />
      <div className="relative h-10 w-[34px]">
        <div
          className="absolute inset-0 text-center font-display font-bold"
          style={{
            fontSize: 42,
            lineHeight: "40px",
            letterSpacing: "-.04em",
            color: "#f2f2f2",
            textShadow: "0 0 26px rgba(226,229,232,.55)",
          }}
        >
          B
        </div>
        {/* the reel punched into the bowl of the B */}
        <div
          aria-hidden="true"
          className="absolute left-[59%] top-[68%] -ml-[7.5px] -mt-[7.5px] h-[15px] w-[15px] rounded-full"
          style={{ background: "#050505" }}
        >
          <div
            className="absolute inset-0"
            style={anim("bp-spin calc(4.4s / var(--bp-spd)) linear infinite")}
          >
            {SPOKES.map((deg) => (
              <div
                key={deg}
                className="absolute left-1/2 top-1/2 -ml-[1.5px] -mt-[1.5px] h-[3px] w-[3px] rounded-full"
                style={{ background: "#f2f2f2", transform: `rotate(${deg}deg) translateY(-4.6px)` }}
              />
            ))}
          </div>
          <div
            className="absolute left-1/2 top-1/2 -ml-[1.5px] -mt-[1.5px] h-[3px] w-[3px] rounded-full"
            style={{ background: "#f2f2f2" }}
          />
        </div>
      </div>
    </div>
    {label && (
      <div
        className="whitespace-nowrap font-mono text-[10px] tracking-[0.3em]"
        style={{
          color: "#eeeeee",
          textShadow: "0 1px 8px rgba(5,5,5,.9), 0 0 2px rgba(5,5,5,.8)",
        }}
      >
        BALCONY ORIGINALS
      </div>
    )}
  </div>
));

LampMark.displayName = "LampMark";
