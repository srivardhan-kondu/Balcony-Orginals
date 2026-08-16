import { useCallback, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Play, RotateCcw } from "lucide-react";
import { ProjectionBeam } from "@/components/projection/ProjectionBeam";
import { ProjectionNav } from "@/components/projection/ProjectionNav";
import { ProjectionTelemetry, ProjectionFrame } from "@/components/projection/ProjectionTelemetry";
import { useProjectionFit } from "@/hooks/use-projection-fit";
import { INTRO_DONE, hasIntroPlayed } from "@/components/Intro";
import { T, at, anim } from "@/lib/projection-timeline";
import { playLamp } from "@/lib/sound";

/* ---------------------------------------------------------------------------
   The projection hero.

   A projector strikes its lamp behind the brand mark and throws a cone of light
   down the page; the headline rises into it line by line. The motion is a pure
   CSS timeline (see the `bp-*` keyframes in index.css) held at
   `animation-play-state: paused` until the splash lifts — everything here is
   sequencing and measurement, never per-frame work.

   `bo-dark`: a projection room is a dark surface by design, like the splash and
   the lightbox, so the theatre palette is pinned here whatever the page theme.
   --------------------------------------------------------------------------- */

const HEADLINE = ["Stories rooted", "in culture.", "Told for the world."];

/** One masked headline line. The wrapper clips; the inner span is what rises. */
const Line = ({ children, at: delay, dim = false }) => (
  <span className="block overflow-hidden whitespace-nowrap pb-[0.04em]">
    <span
      data-fit="1"
      className="inline-block opacity-0"
      style={{
        color: dim ? "#7c7c7c" : undefined,
        textShadow: dim ? "none" : undefined,
        ...anim(`bp-line .95s cubic-bezier(.16,.86,.24,1) ${delay} both`),
      }}
    >
      {children}
    </span>
  </span>
);

export const ProjectionHero = ({
  introDelay = 0.5,
  speed = 1,
  beamSpread = 100,
  beamIntensity = 1,
  telemetry = true,
  replayable = true,
  onOpenMenu,
  onWatchReel,
}) => {
  const stageRef = useRef(null);
  const markRef = useRef(null);
  const copyRef = useRef(null);
  const lampTimer = useRef(null);

  useProjectionFit(stageRef, markRef, copyRef, beamSpread);

  // Props in, custom properties out — the CSS timeline reads them from here.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.style.setProperty("--bp-t0", `${introDelay}s`);
    stage.style.setProperty("--bp-spd", String(speed));
    stage.style.setProperty("--bp-w", String(beamSpread));
    stage.style.setProperty("--bp-beam", String(beamIntensity));
  }, [introDelay, speed, beamSpread, beamIntensity]);

  const run = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    // Two frames: one for the property to land, one for the layers to be laid
    // out at their `from` values before the clock starts.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => stage.style.setProperty("--bp-run", "running"))
    );
    clearTimeout(lampTimer.current);
    lampTimer.current = setTimeout(playLamp, introDelay * 1000);
  }, [introDelay]);

  /* Wait for the splash. Running on `load` — as the original standalone page
     did — would play the whole sequence behind a black overlay and be over
     before the visitor saw the screen. */
  useEffect(() => {
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      run();
    };

    /* The event fires once per page load. Arriving back at `/` from another
       route mounts a fresh hero long after that, with nothing left to listen
       for — it used to sit paused until the failsafe, four seconds of black.
       Ask the latch first, and only wait if the splash is genuinely still up. */
    if (hasIntroPlayed()) {
      start();
    } else {
      window.addEventListener(INTRO_DONE, start);
    }
    // Belt and braces: if the splash never announces (it is skipped, or errors
    // out), the hero must not sit paused forever.
    const failsafe = setTimeout(start, 4000);
    return () => {
      window.removeEventListener(INTRO_DONE, start);
      clearTimeout(failsafe);
      clearTimeout(lampTimer.current);
    };
  }, [run]);

  const replay = () => {
    const stage = stageRef.current;
    if (!stage) return;
    /* Animation shorthands carrying a var() do not serialize, so the CSS cannot
       simply be rewritten to restart. The Web Animations API can cancel and
       replay the running animations directly. */
    stage.style.setProperty("--bp-run", "running");
    stage.getAnimations({ subtree: true }).forEach((a) => {
      a.cancel();
      a.play();
    });
    clearTimeout(lampTimer.current);
    lampTimer.current = setTimeout(playLamp, introDelay * 1000);
  };

  const cta =
    "font-mono text-[clamp(10px,1.1vw,12px)] tracking-[0.24em] transition-colors duration-300";

  return (
    <section
      ref={stageRef}
      data-testid="projection-hero"
      className="bp-stage bo-dark relative flex h-[100svh] min-h-[100svh] flex-col overflow-hidden"
      style={{ background: "#050505", color: "#f2f2f2" }}
    >
      <ProjectionBeam />

      <ProjectionNav markRef={markRef} onOpenMenu={onOpenMenu} />

      <main
        ref={copyRef}
        className="relative z-[2] flex w-full min-h-0 flex-1 flex-col items-center justify-start gap-[clamp(18px,2.6vh,34px)] px-[clamp(20px,4vw,56px)] pb-[clamp(40px,6vh,70px)] text-center short:gap-2 short:pb-6"
        style={{ transform: "scale(var(--bp-cs))", transformOrigin: "50% 0", paddingTop: "var(--bp-pt)" }}
      >
        <h1
          data-testid="hero-headline"
          aria-label="Stories rooted in culture. Told for the world."
          className="m-0 font-display font-bold uppercase leading-[0.98] tracking-[-0.025em]"
          style={{ fontSize: "clamp(22px, 4.5vw, 78px)", textShadow: "0 0 110px rgba(220,224,228,.22)" }}
        >
          <span aria-hidden="true">
            <Line at={at(T.line1)}>{HEADLINE[0]}</Line>
            <Line at={at(T.line2)}>{HEADLINE[1]}</Line>
            <Line at={at(T.line3)} dim>
              {HEADLINE[2]}
            </Line>
          </span>
        </h1>

        <div
          data-anim="eyebrow"
          data-fit="1"
          className="flex items-center gap-3 whitespace-nowrap font-mono text-[clamp(8px,.92vw,11px)] tracking-[0.2em] opacity-0"
          style={{ color: "#b9b9b9", ...anim(`bp-fade 1s ease ${at(T.eyebrow)} both`) }}
        >
          <span aria-hidden="true" className="h-[7px] w-[7px] rotate-45 bg-[#ec3013]" />
          <span>PRODUCTION HOUSE · EST. RAYALASEEMA</span>
        </div>

        <p
          data-anim="sub"
          data-fit="1"
          className="m-0 max-w-[38ch] text-[clamp(13px,1.15vw,16px)] leading-[1.7] opacity-0 [text-wrap:pretty]"
          style={{ color: "#a4a4a4", ...anim(`bp-fadeup 1s cubic-bezier(.2,.8,.2,1) ${at(T.sub)} both`) }}
        >
          Documentaries, films and stories rooted in the people, places and cultures that shape us.
        </p>

        <div
          data-anim="cta"
          data-fit="1"
          className="flex flex-wrap items-center justify-center gap-[clamp(12px,1.6vw,22px)] opacity-0"
          style={anim(`bp-fadeup 1s cubic-bezier(.2,.8,.2,1) ${at(T.cta)} both`)}
        >
          <Link
            to="/works"
            data-testid="hero-explore-btn"
            className={`${cta} bg-[#f2f2f2] px-[clamp(22px,2.4vw,34px)] py-[clamp(15px,1.6vh,20px)] text-[#050505] hover:bg-white`}
          >
            EXPLORE STORIES
          </Link>
          <Link
            to="/submit-story"
            data-testid="hero-submit-story-btn"
            className={`${cta} border border-[#2f2f2f] px-[clamp(22px,2.4vw,34px)] py-[clamp(14px,1.6vh,19px)] hover:border-[#f2f2f2]`}
          >
            SUBMIT YOUR STORY
          </Link>
          <button
            type="button"
            onClick={onWatchReel}
            data-testid="hero-watch-reel-btn"
            className={`${cta} group flex items-center gap-3.5 text-[#b4b4b4] hover:text-white`}
          >
            <span className="grid h-[42px] w-[42px] place-items-center rounded-full border border-[#3a3a3a] transition-colors group-hover:border-[#f2f2f2]">
              <Play size={10} className="ml-px fill-current" />
            </span>
            <span>BRAND FILM</span>
          </button>
        </div>

        {replayable && (
          <button
            type="button"
            onClick={replay}
            data-anim="replay"
            data-testid="hero-replay-btn"
            /* Secondary, and the first thing to go when the frame runs out of
               height — on a phone in landscape it was the row that pushed the
               block into the telemetry strip. */
            className="mt-[clamp(4px,1.2vh,14px)] inline-flex min-h-[44px] items-center gap-2.5 border border-[#262626] bg-white/[0.02] px-4 font-mono text-[9px] tracking-[0.26em] text-[#7d7d7d] opacity-0 transition-colors hover:border-[#f2f2f2] hover:text-[#f2f2f2] short:hidden"
            style={anim(`bp-fade 1s ease ${at(T.replay)} both`)}
          >
            <RotateCcw size={11} />
            REPLAY INTRO
          </button>
        )}
      </main>

      <ProjectionFrame />
      {telemetry && <ProjectionTelemetry />}
    </section>
  );
};
