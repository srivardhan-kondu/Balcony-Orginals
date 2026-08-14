import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const SCENES = {
  "/": "HOME",
  "/works": "THE ARCHIVE",
  "/upcoming": "UPCOMING",
  "/submit-story": "STORIES ARE GEMS",
  "/about": "ABOUT",
  "/contact": "CONTACT",
};

const sceneFor = (pathname) => {
  if (SCENES[pathname]) return SCENES[pathname];
  if (pathname.startsWith("/projects/")) return pathname.split("/").pop().replace(/-/g, " ").toUpperCase();
  return "UNTITLED";
};

export const ClapperTransition = () => {
  const { pathname } = useLocation();
  const [take, setTake] = useState(null);
  const takeNo = useRef(0);
  const first = useRef(true);
  const timers = useRef([]);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    timers.current.forEach(clearTimeout);
    takeNo.current += 1;
    setTake({ scene: sceneFor(pathname), no: takeNo.current, phase: "in" });
    timers.current = [
      setTimeout(() => setTake((s) => (s ? { ...s, phase: "snap" } : s)), 430),
      setTimeout(() => setTake((s) => (s ? { ...s, phase: "out" } : s)), 920),
      setTimeout(() => setTake(null), 1500),
    ];
    return () => timers.current.forEach(clearTimeout);
  }, [pathname]);

  if (!take) return null;

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

  return (
    <div data-testid="page-transition-overlay" data-phase={take.phase} className="bo-take" aria-hidden="true">
      <div className="bo-clap" data-testid="clapperboard">
        <div className="bo-clap-arm" />
        <div className="bo-clap-body">
          <div className="flex items-center justify-between border-b border-bone/10 pb-2.5 font-mono text-[9px] tracking-[0.24em] text-bone/50">
            <span>PROD · BALCONY ORIGINALS</span>
            <span>35 MM</span>
          </div>
          <div className="grid grid-cols-[1fr_auto_auto] gap-6 border-b border-bone/10 py-3.5">
            <div>
              <div className="font-mono text-[8px] tracking-[0.26em] text-bone/35">SCENE</div>
              <div data-testid="clap-scene" className="mt-1 truncate font-display text-sm font-bold uppercase tracking-wide text-bone">
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
  );
};
