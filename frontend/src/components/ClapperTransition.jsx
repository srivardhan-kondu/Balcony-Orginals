"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { playClap } from "@/lib/sound";

const SCENES = {
  "/": "HOME",
  "/works": "THE ARCHIVE",
  "/upcoming": "UPCOMING",
  "/submit-story": "STORIES ARE GEMS",
  "/about": "ABOUT",
  "/contact": "CONTACT",
};

/* The archive is one route serving several destinations, so the slate has to
   read the query too — otherwise clicking FILMS calls a take named THE ARCHIVE. */
const WORKS_SCENES = { feature: "FILMS", documentary: "DOCUMENTARIES" };

const sceneFor = (pathname, query) => {
  if (pathname === "/works" && query) {
    const q = new URLSearchParams(query);
    const filter = q.get("type") || q.get("category");
    if (filter) return WORKS_SCENES[filter] || filter.replace(/-/g, " ").toUpperCase();
  }
  if (SCENES[pathname]) return SCENES[pathname];
  if (pathname.startsWith("/projects/")) return pathname.split("/").pop().replace(/-/g, " ").toUpperCase();
  return "UNTITLED";
};

/* The slate is one fixed width; the scene names are not. HOME is four
   characters, STORIES ARE GEMS is sixteen, and a project slug read off the URL
   can run past thirty. Truncating a take name is the one thing a slate must
   never do — an unreadable board is a wasted take — so the type steps down a
   register per section and the name is allowed a second line instead. */
const sceneType = (scene) => {
  if (scene.length <= 11) return "text-[15px] leading-none";
  if (scene.length <= 18) return "text-[13px] leading-tight";
  if (scene.length <= 28) return "text-[11px] leading-tight";
  return "text-[9.5px] leading-tight";
};

/* ---------------------------------------------------------------------------
   Suppressing a take.

   Under react-router this component asked `useNavigationType()` whether the
   move was a PUSH or a REPLACE, and stayed out of the way for replacements —
   which is how the archive's own filter chips avoided calling a 1.5s
   clapperboard between "show me documentaries" and "show me features".

   The App Router has no equivalent to ask: `router.replace` and `router.push`
   are indistinguishable once the location has changed. So the intent is stated
   rather than inferred — the caller says "this one is a refinement, not a
   journey" before it navigates. Same idiom as `openMenu` in Header.jsx: one
   latch, for one caller, rather than a context nothing else would use.

   A latch and not an event, because it has to survive the render that the
   navigation triggers. It is consumed on the next location change and cannot
   accumulate.
   --------------------------------------------------------------------------- */
let suppressed = false;
export const skipNextTake = () => {
  suppressed = true;
};

export const ClapperTransition = () => {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const [take, setTake] = useState(null);
  const takeNo = useRef(0);
  /* The location we last called a take on. A boolean "have we mounted yet" flag
     is not enough: StrictMode mounts, tears down and remounts in development,
     which flips the flag and fires a take on first load. Comparing the actual
     location can't be fooled that way, because nothing has moved. */
  const seen = useRef(`${pathname}?${query}`);
  const timers = useRef([]);

  /* The query belongs in here as much as the pathname does. STORIES and FILMS
     sit next to each other in the nav but are /works and /works?type=feature —
     the same route — so watching the pathname alone meant the most ordinary
     jump on the site swapped the page with no take at all. */
  useEffect(() => {
    const here = `${pathname}?${query}`;
    const from = seen.current;
    seen.current = here;
    if (from === here) return;
    if (suppressed) {
      suppressed = false;
      return;
    }

    timers.current.forEach(clearTimeout);
    takeNo.current += 1;
    setTake({ scene: sceneFor(pathname, query), no: takeNo.current, phase: "in" });
    /* One take, two seconds, marked the way a real one is: the slate is held
       shut, the arm comes up at 0.5s, and the sticks meet at 1.2s. The clap is
       fired 120ms after the fall begins rather than with it — the sound belongs
       to the impact, and hearing it while the arm is still in the air is the
       tell that undoes the whole illusion. */
    timers.current = [
      setTimeout(() => setTake((s) => (s ? { ...s, phase: "lift" } : s)), 500),
      setTimeout(() => setTake((s) => (s ? { ...s, phase: "snap" } : s)), 1200),
      setTimeout(playClap, 1320),
      setTimeout(() => setTake((s) => (s ? { ...s, phase: "out" } : s)), 1560),
      setTimeout(() => setTake(null), 2000),
    ];
    return () => timers.current.forEach(clearTimeout);
  }, [pathname, query]);

  if (!take) return null;

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

  return (
    <div data-testid="page-transition-overlay" data-phase={take.phase} className="bo-take" aria-hidden="true">
      <div className="bo-clap" data-testid="clapperboard">
        <div className="bo-clap-rig">
          <div className="bo-clap-sticks">
            <div className="bo-clap-arm-fixed" />
            <div className="bo-clap-arm" />
          </div>
          <div className="bo-clap-body">
            <div className="flex items-center justify-between border-b border-bone/10 pb-2.5 font-mono text-[9px] tracking-[0.24em] text-bone/50">
              <span>PROD · BALCONY ORIGINALS</span>
              <span>35 MM</span>
            </div>
            <div className="grid grid-cols-[1fr_auto_auto] items-start gap-4 border-b sm:gap-6 border-bone/10 py-3.5">
              <div>
                <div className="font-mono text-[8px] tracking-[0.26em] text-bone/35">SCENE</div>
                <div
                  data-testid="clap-scene"
                  className={`mt-1 font-display font-bold uppercase tracking-wide text-bone [overflow-wrap:anywhere] ${sceneType(take.scene)}`}
                >
                  {take.scene}
                </div>
              </div>
              <div>
                <div className="font-mono text-[8px] tracking-[0.26em] text-bone/35">TAKE</div>
                <div data-testid="clap-take" className="mt-1 font-display text-sm font-bold text-bone">
                  {String(take.no).padStart(2, "0")}
                </div>
              </div>
              <div>
                <div className="font-mono text-[8px] tracking-[0.26em] text-bone/35">FPS</div>
                <div className="mt-1 font-display text-sm font-bold text-bone">24</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-2.5 font-mono text-[9px] tracking-[0.24em] text-bone/50">
              <span>DIR · BALCONY ORIGINALS</span>
              <span>{today}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
