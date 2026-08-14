import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STATUS_LABELS } from "@/lib/api";

export const FilmRing = ({ projects = [] }) => {
  const navigate = useNavigate();
  const items = projects.length ? [...projects, ...projects] : [];
  const n = items.length;
  const ringRef = useRef(null);
  const rot = useRef(0);
  const vel = useRef(0.1);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const moved = useRef(0);
  const [radius, setRadius] = useState(520);
  const radiusRef = useRef(520);
  radiusRef.current = radius;

  useEffect(() => {
    const fit = () => setRadius(Math.max(270, Math.min(520, window.innerWidth * 0.36)));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(() => {
    let raf;
    const tick = () => {
      if (!dragging.current) {
        rot.current += vel.current;
        vel.current += (0.1 - vel.current) * 0.03;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(-50%, -50%) translateZ(${-radiusRef.current}px) rotateX(-4deg) rotateY(${rot.current}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const down = (e) => {
    dragging.current = true;
    moved.current = 0;
    lastX.current = e.clientX;
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const move = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    rot.current += dx * 0.22;
    vel.current = dx * 0.05;
    moved.current += Math.abs(dx);
  };
  const up = () => {
    dragging.current = false;
  };

  if (!n) return null;

  return (
    <div data-testid="film-ring-section" className="relative mt-4">
      <div
        data-testid="film-ring"
        role="region"
        aria-label="Interactive 3D archive of featured stories — drag to rotate"
        className="relative mx-auto h-[400px] cursor-grab select-none active:cursor-grabbing md:h-[540px]"
        style={{ perspective: "1500px", touchAction: "pan-y" }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <div
          ref={ringRef}
          className="absolute left-1/2 top-1/2 h-[190px] w-[290px] md:h-[230px] md:w-[350px]"
          style={{
            transformStyle: "preserve-3d",
            transform: `translate(-50%, -50%) translateZ(${-radius}px) rotateX(-4deg)`,
          }}
        >
          {items.map((p, i) => (
            <div
              key={`${p.slug}-${i}`}
              data-testid={`film-ring-panel-${i}`}
              onClick={() => {
                if (moved.current < 8) navigate(`/projects/${p.slug}`);
              }}
              className="group absolute inset-0 overflow-hidden rounded-sm border border-line bg-ink2"
              style={{
                transform: `rotateY(${(360 / n) * i}deg) translateZ(${radius}px)`,
                backfaceVisibility: "hidden",
              }}
            >
              <img
                src={p.hero}
                alt={p.title}
                draggable={false}
                className="h-full w-full object-cover opacity-90 transition-opacity duration-300 group-hover:opacity-100"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-bone/60">
                  {STATUS_LABELS[p.status] || p.status}
                </div>
                <div className="mt-1 font-serif text-lg leading-tight text-bone">{p.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none mx-auto -mt-8 h-20 w-[70%] rounded-[100%] bg-bone/[0.05] blur-3xl" />
      <div
        data-testid="film-ring-hint"
        className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40"
      >
        Drag to rotate · {projects.length} featured stories
      </div>
    </div>
  );
};
