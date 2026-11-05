"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { releaseIntro } from "@/components/Intro";
import { skipNextTake } from "@/components/ClapperTransition";
import { isLaunchRequested, launchCount, LAUNCH_PARAM } from "@/lib/launch";
import { getAudioContext, playBeep, playClap, playLamp, playSwell } from "@/lib/sound";
import { SITE_URL, TAGLINE } from "@/lib/site";

/* ---------------------------------------------------------------------------
   The launch ceremony. Only shown at `/?launch` (see lib/launch.js).

   ready  → a premiere screen with one LAUNCH button, waiting for the guest
   arm    → the button is pressed: the projector lamp strikes, the screen clears
   count  → numbers projected in a beam of light, one beep a second
   flash  → the clap at zero: the beam floods the screen white
   live   → "Now live" over the brand mark, confetti
   open   → the screen splits down the middle and slides away onto the site
   --------------------------------------------------------------------------- */

const ARM_MS = 800;
// Long enough for the beam to flood the screen before the card appears.
const FLASH_MS = 420;
const LIVE_MS = 3600;
const OPEN_MS = 1300;

// Keys a presentation clicker sends, as well as the obvious ones.
const LAUNCH_KEYS = new Set(["Enter", " ", "ArrowRight", "PageDown"]);

const HOST = (() => {
  try {
    return new URL(SITE_URL).host.replace(/^www\./, "");
  } catch {
    return "balconyoriginals.com";
  }
})();

export const LaunchCeremony = () => {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState("ready");
  const [count, setCount] = useState(0);
  const [confetti, setConfetti] = useState(false);
  const [today, setToday] = useState("");
  const total = useRef(5);
  const timers = useRef([]);
  const started = useRef(false);
  const reduced = useRef(false);

  // Decided in the browser only, like the splash: the page is prerendered.
  useEffect(() => {
    if (!isLaunchRequested()) return;
    total.current = launchCount();
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setToday(
      new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
    );
    setActive(true);
  }, []);

  // Hold the page still underneath while the ceremony owns the screen.
  useEffect(() => {
    if (!active) return;
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    window.__lenis?.stop?.();
    return () => {
      html.style.overflow = prev;
      window.__lenis?.start?.();
    };
  }, [active]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const finish = useCallback(() => {
    // Clean the address bar, without the page-change clapper firing for it.
    const url = new URL(window.location.href);
    if (url.searchParams.has(LAUNCH_PARAM)) {
      url.searchParams.delete(LAUNCH_PARAM);
      skipNextTake();
      window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
    }
    setActive(false);
  }, []);

  const run = useCallback(() => {
    const n = total.current;
    const at = (ms, fn) => timers.current.push(setTimeout(fn, ms));

    setPhase("arm");
    playLamp();

    for (let i = 0; i < n; i++) {
      at(ARM_MS + i * 1000, () => {
        setPhase("count");
        setCount(n - i);
        playBeep(i === n - 1);
      });
    }

    const zero = ARM_MS + n * 1000;
    at(zero, () => {
      setPhase("flash");
      playClap();
      playSwell();
    });
    at(zero + FLASH_MS, () => {
      setPhase("live");
      if (!reduced.current) setConfetti(true);
    });
    at(zero + FLASH_MS + LIVE_MS, () => {
      setPhase("open");
      // Starts the home page's projection hero as the screen opens onto it.
      releaseIntro();
    });
    at(zero + FLASH_MS + LIVE_MS + OPEN_MS, finish);
  }, [finish]);

  const launch = useCallback(() => {
    if (started.current) return;
    started.current = true;
    // Fullscreen for the projector, when the browser allows it.
    document.documentElement.requestFullscreen?.().catch(() => {});
    // Sound only plays once the browser has resumed audio after this click,
    // so the first beep must wait for that.
    const c = getAudioContext();
    const ready = c && c.state === "suspended" ? c.resume().catch(() => {}) : Promise.resolve();
    ready.finally(run);
  }, [run]);

  useEffect(() => {
    if (!active || phase !== "ready") return;
    const onKey = (e) => {
      if (!LAUNCH_KEYS.has(e.key)) return;
      e.preventDefault();
      launch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, phase, launch]);

  return (
    <>
      {active && (
        <div
          data-testid="launch-ceremony"
          data-phase={phase}
          role="dialog"
          aria-modal="true"
          aria-label="Balcony Originals website launch"
          className="bo-launch"
        >
          {/* Two halves of one black screen, so it can split open at the end. */}
          <div className="bo-launch-half bo-launch-half--l" aria-hidden="true" />
          <div className="bo-launch-half bo-launch-half--r" aria-hidden="true" />
          <div className="bo-launch-spot" aria-hidden="true" />

          {/* ── Ready ─────────────────────────────────────────────── */}
          <div className="bo-launch-ready">
            <div className="bo-launch-bar">
              <span className="max-sm:mx-auto">Balcony Originals · Website Premiere</span>
              <span className="hidden sm:inline">{today}</span>
            </div>

            <div className="flex flex-col items-center px-6 text-center">
              <img
                src="/assets/bo-lockup.png"
                alt="Balcony Originals"
                className="bo-launch-logo w-[min(300px,62vw)] short:w-[min(200px,40vh)]"
              />
              <p className="mt-[clamp(18px,4vh,36px)] font-mono text-[10px] uppercase tracking-[0.42em] text-gold sm:text-[11px]">
                World Premiere
              </p>
              <h1 className="mt-3 font-serif text-[clamp(24px,4.2vw,44px)] leading-tight text-bone">
                A new home for our stories.
              </h1>

              <button
                type="button"
                onClick={launch}
                data-testid="launch-button"
                className="bo-launch-btn mt-[clamp(28px,6vh,56px)]"
                aria-label="Launch the website"
              >
                <span className="bo-launch-btn-ring" aria-hidden="true" />
                <span className="bo-launch-btn-ring bo-launch-btn-ring--2" aria-hidden="true" />
                <span className="bo-launch-btn-core">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 translate-x-[2px]" aria-hidden="true">
                    <path d="M7 4.5v15l12.5-7.5z" fill="currentColor" />
                  </svg>
                  <span className="mt-1.5 font-mono text-[10px] font-medium tracking-[0.34em]">LAUNCH</span>
                </span>
              </button>
              <p className="mt-5 font-mono text-[9.5px] uppercase tracking-[0.3em] text-dim">
                Click or press Enter
              </p>
            </div>

            <div className="bo-launch-bar bo-launch-bar--foot">
              <span className="mx-auto">{TAGLINE}</span>
            </div>
          </div>

          {/* ── Countdown: projected in a beam ─────────────────────── */}
          {(phase === "arm" || phase === "count" || phase === "flash") && (
            <div className="bo-beam" aria-live="assertive">
              {/* Wrapper blurs, inner clips: soft beam edges, not hard ones. */}
              <div className="bo-beam-soft" aria-hidden="true">
                <div className="bo-beam-clip" />
              </div>
              <div className="bo-beam-soft bo-beam-soft--core" aria-hidden="true">
                <div className="bo-beam-clip bo-beam-clip--core" />
              </div>
              {count > 0 && (
                <div key={`p${count}`} className="bo-beam-soft bo-beam-pulse" aria-hidden="true">
                  <div className="bo-beam-clip" />
                </div>
              )}
              {!reduced.current && <BeamDust />}

              <div className="bo-beam-lamp" aria-hidden="true">
                <img src="/assets/bo-mark.png" alt="" className="h-full w-auto" />
              </div>

              {count > 0 && (
                <div className="bo-beam-screen">
                  <p className="bo-beam-label">The premiere begins in</p>
                  <div className="bo-beam-nums">
                    {/* The outgoing number fades as the next one lands, so
                        there is never an empty frame between them. */}
                    {count < total.current && (
                      <span key={`o${count + 1}`} className="bo-beam-num bo-beam-num--out" aria-hidden="true">
                        {count + 1}
                      </span>
                    )}
                    <span key={`n${count}`} className="bo-beam-num">
                      {count}
                    </span>
                  </div>
                </div>
              )}

              <div className="bo-launch-bar bo-beam-telemetry" aria-hidden="true">
                <span>
                  <span className="text-terra">●</span>&nbsp; Projecting · Reel 01
                </span>
                <span>T-minus 00:{String(count).padStart(2, "0")}</span>
              </div>
            </div>
          )}

          {/* ── Flash ─────────────────────────────────────────────── */}
          <div className="bo-launch-flash" aria-hidden="true" />

          {/* ── Live ──────────────────────────────────────────────── */}
          {(phase === "live" || phase === "open") && (
            <div className="bo-launch-live" aria-live="assertive">
              <div className="bo-launch-flare" aria-hidden="true" />
              <img src="/assets/bo-lockup.png" alt="" className="bo-launch-live-logo w-[min(340px,66vw)] short:w-[min(220px,42vh)]" />
              <p className="bo-launch-live-tag mt-[clamp(20px,4vh,40px)] font-mono text-[11px] uppercase tracking-[0.5em] text-gold sm:text-[12px]">
                ● Now Live
              </p>
              <p className="bo-launch-live-url mt-3 px-6 text-center font-serif text-[clamp(28px,5.6vw,64px)] leading-none text-bone">
                {HOST}
              </p>
              <span className="bo-launch-live-rule mt-[clamp(18px,3.4vh,30px)] h-px w-[60px] bg-gold/50" aria-hidden="true" />
              <p className="bo-launch-live-sub mt-[clamp(14px,2.6vh,22px)] px-8 text-center font-mono text-[10px] uppercase leading-[2] tracking-[0.3em] text-mute">
                {TAGLINE}
              </p>
            </div>
          )}
        </div>
      )}

      {confetti && <Confetti onDone={() => setConfetti(false)} />}
    </>
  );
};

/* ---------------------------------------------------------------------------
   Dust in the beam: motes drift everywhere, but are only lit where they cross
   the light, brightest down its centre. The beam's shape here matches the
   clip-path in index.css (.bo-beam-clip).
   --------------------------------------------------------------------------- */

const BEAM_TOP = 0.09;
const BEAM_TOP_HALF = 0.03;
const BEAM_BOTTOM_HALF = 0.58;

const BeamDust = () => {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const rand = (a, b) => a + Math.random() * (b - a);
    const motes = Array.from({ length: Math.round(Math.min(220, (w * h) / 7000)) }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: rand(-0.00012, 0.00012),
      vy: rand(-0.00022, -0.00004),
      r: rand(0.5, 2.1),
      tw: rand(0, Math.PI * 2),
      tws: rand(0.02, 0.06),
      a: rand(0.35, 1),
    }));

    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(3, (now - last) / 16.67);
      last = now;
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.x += m.vx * dt;
        m.y += m.vy * dt;
        m.tw += m.tws * dt;
        if (m.y < BEAM_TOP) m.y = 1.02;
        if (m.x < -0.02) m.x = 1.02;
        if (m.x > 1.02) m.x = -0.02;

        // How deep inside the beam this mote is, 0 at the edge to 1 at the centre.
        const t = (m.y - BEAM_TOP) / (1 - BEAM_TOP);
        if (t <= 0) continue;
        const half = BEAM_TOP_HALF + (BEAM_BOTTOM_HALF - BEAM_TOP_HALF) * t;
        const off = Math.abs(m.x - 0.5) / half;
        if (off >= 1) continue;
        const lit = (1 - off * off) * (0.55 + 0.45 * Math.sin(m.tw)) * m.a * (1 - t * 0.35);

        ctx.beginPath();
        ctx.arc(m.x * w, m.y * h, m.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 238, 205, ${lit * 0.75})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />;
};

/* ---------------------------------------------------------------------------
   Confetti: two cannons fire from the bottom corners, then the pieces drift
   down over the opening site and the canvas removes itself.
   --------------------------------------------------------------------------- */

const COLORS = ["#C7A05A", "#D4AF37", "#E8CF8A", "#ECECEB", "#B0402F"];
const PIECES = 220;
const MAX_MS = 9000;

const Confetti = ({ onDone }) => {
  const ref = useRef(null);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return done.current();

    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const scale = Math.min(1.25, Math.max(0.7, w / 1200));
    const rand = (a, b) => a + Math.random() * (b - a);
    const parts = Array.from({ length: PIECES }, (_, i) => {
      const left = i % 2 === 0;
      // Up and inwards from each corner, fanned out (angle measured from vertical).
      const angle = rand(0.12, 0.6);
      // Sized to the screen height, so the burst reaches about two-thirds up on any screen.
      const speed = rand(0.75, 1.3) * Math.sqrt(0.3 * h);
      return {
        x: left ? rand(-10, 30) : w - rand(-10, 30),
        y: h + rand(0, 20),
        vx: (left ? 1 : -1) * Math.sin(angle) * speed,
        vy: -Math.cos(angle) * speed,
        size: rand(6, 12) * scale,
        ratio: rand(0.35, 0.7),
        rot: rand(0, Math.PI * 2),
        spin: rand(-0.25, 0.25),
        flip: rand(0, Math.PI * 2),
        flipSpeed: rand(0.08, 0.2),
        sway: rand(0, Math.PI * 2),
        color: COLORS[(Math.random() * COLORS.length) | 0],
        delay: i < PIECES / 2 ? 0 : rand(120, 520),
      };
    });

    let raf;
    let last = performance.now();
    const t0 = last;
    const tick = (now) => {
      const dt = Math.min(2.5, (now - last) / 16.67);
      last = now;
      const elapsed = now - t0;
      ctx.clearRect(0, 0, w, h);

      let alive = 0;
      for (const p of parts) {
        if (elapsed < p.delay) {
          alive++;
          continue;
        }
        p.vy += 0.32 * dt;
        p.vx *= Math.pow(0.985, dt);
        p.vy *= Math.pow(0.985, dt);
        // Once falling, paper flutters: terminal speed and a sideways sway.
        if (p.vy > 2.4) p.vy = 2.4;
        p.sway += 0.05 * dt;
        p.x += (p.vx + (p.vy > 0 ? Math.sin(p.sway) * 0.9 : 0)) * dt;
        p.y += p.vy * dt;
        p.rot += p.spin * dt;
        p.flip += p.flipSpeed * dt;
        if (p.y > h + 40 && p.vy > 0) continue;
        alive++;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.flip));
        ctx.fillStyle = p.color;
        ctx.globalAlpha = elapsed > MAX_MS - 1200 ? Math.max(0, (MAX_MS - elapsed) / 1200) : 1;
        ctx.fillRect(-p.size / 2, (-p.size * p.ratio) / 2, p.size, p.size * p.ratio);
        ctx.restore();
      }

      if (alive === 0 || elapsed > MAX_MS) return done.current();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[215] h-full w-full" />;
};
