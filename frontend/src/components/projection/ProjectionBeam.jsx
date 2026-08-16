/* ---------------------------------------------------------------------------
   The light.

   Six layers, each doing one job and none of them interactive:

     wash    the room lifting off black as the lamp warms
     strike  the flash at the moment the arc catches
     fan     the cone itself — four clipped slices: a wide blurred body, a
             tighter core, and two hot edges that read as the rim of the beam
     scan    a 1px scanline grid, drifting
     motes   dust falling through the light
     vignette closes the corners so the frame reads as projected, not pasted

   The cone's apex and spread come from `--bp-ax` and `--bp-w`, so the whole
   thing re-aims itself when the lamp mark moves.
   --------------------------------------------------------------------------- */

import { T, at, over, anim } from "@/lib/projection-timeline";

/* left/top/size/duration/delay for each mote — a fixed scatter rather than a
   random one, so the fall never clumps and never changes between renders. */
const MOTES = [
  ["9%", "24%", 2, 21, -7],
  ["17%", "8%", 3, 18, -2],
  ["25%", "40%", 2, 24, -15],
  ["33%", "16%", 3, 16, -9],
  ["44%", "6%", 3, 14, 0],
  ["52%", "30%", 2, 17, -6],
  ["61%", "12%", 2, 19, -16],
  ["69%", "44%", 3, 22, -11],
  ["78%", "20%", 2, 20, -4],
  ["88%", "34%", 3, 23, -13],
];

/** One slice of the cone: `topHalf` px wide at the apex, `bottomPct` at the floor. */
const slice = (topHalf, bottomPct, background, blur) => ({
  position: "absolute",
  inset: 0,
  clipPath: `polygon(calc(50% - ${topHalf}px) var(--bp-ax), calc(50% + ${topHalf}px) var(--bp-ax), calc(50% + var(--bp-w) * ${bottomPct}%) 100%, calc(50% - var(--bp-w) * ${bottomPct}%) 100%)`,
  background,
  filter: `blur(${blur}px)`,
});

/** A hot edge: a thin wedge tracking one wall of the cone. */
const edge = (sign) => ({
  position: "absolute",
  inset: 0,
  clipPath:
    sign < 0
      ? "polygon(calc(50% - 23px) var(--bp-ax), calc(50% - 20px) var(--bp-ax), calc(50% - var(--bp-w) * .885%) 100%, calc(50% - var(--bp-w) * .915%) 100%)"
      : "polygon(calc(50% + 20px) var(--bp-ax), calc(50% + 23px) var(--bp-ax), calc(50% + var(--bp-w) * .915%) 100%, calc(50% + var(--bp-w) * .885%) 100%)",
  background:
    "linear-gradient(rgba(232,236,240,.3), rgba(190,196,202,.06) 58%, rgba(180,186,192,0) 100%)",
  filter: "blur(3px)",
});

export const ProjectionBeam = () => (
  <>
    <div
      data-anim="wash"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-full opacity-0"
      style={anim(`bp-fade 1.5s cubic-bezier(.3,.7,.2,1) ${at(T.wash)} both`)}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(130% 105% at 50% 7%, rgba(206,210,214,.085), rgba(178,183,188,.04) 36%, rgba(150,156,162,.018) 64%, rgba(0,0,0,0) 100%)",
          opacity: "var(--bp-beam)",
        }}
      />
    </div>

    <div
      data-anim="fan"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-full"
      style={{
        transformOrigin: "50% var(--bp-ax)",
        opacity: "var(--bp-beam)",
        ...anim(`bp-throw ${over(T.beamDuration)} cubic-bezier(.16,.9,.24,1) ${at(T.beam)} both, bp-flick ${over(3.2)} steps(1,end) ${at(T.flicker)} infinite`),
      }}
    >
      <div
        style={slice(
          25,
          ".96",
          "linear-gradient(rgba(212,216,220,.115), rgba(186,191,196,.055) 34%, rgba(160,166,172,.026) 68%, rgba(140,146,152,.012) 100%)",
          26
        )}
      />
      <div
        style={slice(
          23,
          ".9",
          "linear-gradient(rgba(224,228,232,.15), rgba(196,201,206,.06) 40%, rgba(168,174,180,.022) 100%)",
          9
        )}
      />
      <div style={edge(-1)} />
      <div style={edge(1)} />
    </div>

    <div
      data-anim="strike"
      aria-hidden="true"
      className="pointer-events-none absolute left-1/2 opacity-0"
      style={{
        top: "var(--bp-ax)",
        width: "min(420px, 42vw)",
        height: "min(420px, 42vw)",
        background:
          "radial-gradient(closest-side, rgba(240,243,246,.34), rgba(206,211,216,.1) 42%, rgba(0,0,0,0) 100%)",
        ...anim(`bp-strike ${over(1.4)} cubic-bezier(.2,.85,.25,1) ${at(T.strike)} both`),
      }}
    />

    <div
      data-anim="scan"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-full overflow-hidden opacity-0"
      style={anim(`bp-fade 2s ease ${at(T.scan)} both`)}
    >
      <div
        className="absolute inset-x-0 top-0 h-[200%]"
        style={{
          background:
            "repeating-linear-gradient(180deg, rgba(255,255,255,.028) 0 1px, rgba(0,0,0,0) 1px 3px)",
          ...anim(`bp-scan ${over(24)} linear infinite`),
        }}
      />
    </div>

    <div
      data-anim="motes"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 top-20 opacity-0"
      style={anim(`bp-fade 1.8s ease ${at(T.motes)} both`)}
    >
      {MOTES.map(([left, top, size, duration, delay]) => (
        <div
          key={`${left}-${top}`}
          className="absolute rounded-full"
          style={{
            left,
            top,
            width: size,
            height: size,
            background: "#f4f6f8",
            ...anim(`bp-fall ${over(duration)} linear infinite`),
            animationDelay: `${delay}s`,
          }}
        />
      ))}
    </div>

    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(125% 95% at 50% 34%, rgba(5,5,5,0) 42%, rgba(5,5,6,.64) 78%, rgba(3,3,4,.9) 100%)",
      }}
    />
  </>
);
