import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Volume2, VolumeX } from "lucide-react";
import { STATUS_LABELS } from "@/lib/api";
import { getAudioContext, getMaster, isSoundEnabled, setSoundEnabled, subscribeSound } from "@/lib/sound";

export const FilmRing = ({ projects = [] }) => {
  const navigate = useNavigate();
  const items = projects.length ? [...projects, ...projects] : [];
  const n = items.length;
  const ringRef = useRef(null);
  const panelRefs = useRef([]);
  const rot = useRef(0);
  const vel = useRef(0.1);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const lastScroll = useRef(0);
  const moved = useRef(0);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const soundRef = useRef(isSoundEnabled());
  const audioRef = useRef(null);
  const [radius, setRadius] = useState(720);
  const radiusRef = useRef(720);
  radiusRef.current = radius;

  useEffect(() => {
    const fit = () => setRadius(Math.max(340, Math.min(760, window.innerWidth * 0.46)));
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  useEffect(
    () =>
      subscribeSound((v) => {
        setSoundOn(v);
        soundRef.current = v;
      }),
    []
  );

  useEffect(() => {
    let raf;
    const tick = () => {
      if (!dragging.current) {
        rot.current += vel.current;
        vel.current *= 0.965;
        vel.current += (0.09 - vel.current) * 0.008;
      }
      // the reel also turns as the page scrolls
      const sy = window.scrollY || 0;
      rot.current += (sy - lastScroll.current) * 0.03;
      lastScroll.current = sy;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(-50%, -50%) translateZ(${-radiusRef.current}px) rotateX(-5deg) rotateY(${rot.current}deg)`;
      }
      // spotlight: the story facing you burns brightest
      const seg = 360 / (panelRefs.current.length || 1);
      panelRefs.current.forEach((el, i) => {
        if (!el) return;
        const a = (((rot.current + i * seg) % 360) + 360) % 360;
        const facing = Math.max(-1, Math.min(1, Math.cos((a * Math.PI) / 180)));
        const b = 0.45 + 0.6 * Math.max(0, facing);
        el.style.filter = `brightness(${b.toFixed(3)})`;
      });
      const a = audioRef.current;
      if (a) {
        const speed = Math.min(Math.abs(vel.current), 5);
        const target = soundRef.current ? Math.min(speed * 0.05, 0.16) : 0;
        a.gain.gain.setTargetAtTime(target, a.ctx.currentTime, 0.12);
        a.bp.frequency.setTargetAtTime(380 + speed * 260, a.ctx.currentTime, 0.2);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      const a2 = audioRef.current;
      if (a2) {
        try {
          a2.src.stop();
        } catch {}
        a2.gain.disconnect();
        audioRef.current = null;
      }
    };
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
    rot.current += dx * 0.14;
    vel.current = Math.max(-6, Math.min(6, vel.current * 0.5 + dx * 0.05));
    moved.current += Math.abs(dx);
  };
  const up = () => {
    dragging.current = false;
  };

  const ensureWhir = () => {
    if (audioRef.current) return audioRef.current;
    const ctx = getAudioContext();
    const master = getMaster();
    if (!ctx || !master) return null;
    const len = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 480;
    bp.Q.value = 1.1;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    src.connect(bp);
    bp.connect(gain);
    gain.connect(master);
    src.start();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 7;
    lfoGain.gain.value = 0.05;
    lfo.connect(lfoGain);
    lfoGain.connect(src.playbackRate);
    lfo.start();
    audioRef.current = { ctx, gain, bp, src };
    return audioRef.current;
  };

  const toggleSound = async () => {
    const next = !soundOn;
    soundRef.current = next;
    if (next) ensureWhir();
    await setSoundEnabled(next);
  };

  if (!n) return null;

  return (
    <div data-testid="film-ring-section" className="relative mt-2">
      <div
        data-testid="film-ring"
        role="region"
        aria-label="Interactive 3D archive of featured stories — drag to rotate"
        className="relative mx-auto h-[460px] cursor-grab select-none active:cursor-grabbing md:h-[62vh] md:min-h-[540px]"
        style={{ perspective: "1700px", touchAction: "pan-y" }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <div
          ref={ringRef}
          className="absolute left-1/2 top-[44%] h-[220px] w-[330px] md:h-[300px] md:w-[470px]"
          style={{
            transformStyle: "preserve-3d",
            transform: `translate(-50%, -50%) translateZ(${-radius}px) rotateX(-5deg)`,
          }}
        >
          {items.map((p, i) => (
            <div
              key={`${p.slug}-${i}`}
              ref={(el) => (panelRefs.current[i] = el)}
              data-testid={`film-ring-panel-${i}`}
              onClick={() => {
                if (moved.current < 8) navigate(`/projects/${p.slug}`);
              }}
              className="group absolute inset-0 cursor-pointer"
              style={{
                transform: `rotateY(${(360 / n) * i}deg) translateZ(${radius}px)`,
                backfaceVisibility: "hidden",
              }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-sm border border-line bg-ink2 shadow-[0_40px_90px_rgba(0,0,0,0.55)]">
                <img src={p.hero} alt={p.title} draggable={false} className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-transparent" />
                <span aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-bone/40" />
                <span aria-hidden="true" className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-bone/40" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-bone/65">
                    {STATUS_LABELS[p.status] || p.status}
                  </div>
                  <div className="mt-1.5 font-display text-xl font-bold uppercase leading-tight tracking-tight text-bone md:text-2xl">
                    {p.title}
                  </div>
                </div>
              </div>
              {/* floor reflection */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-full h-[58%] w-full opacity-[0.16]"
                style={{
                  transform: "scaleY(-1)",
                  WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 80%)",
                  maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent 80%)",
                }}
              >
                <img src={p.hero} alt="" draggable={false} className="h-full w-full object-cover" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="pointer-events-none mx-auto -mt-6 h-24 w-[78%] rounded-[100%] bg-bone/[0.06] blur-3xl" />
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <span
          data-testid="film-ring-hint"
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40"
        >
          Drag to rotate · scroll turns the reel · {projects.length} featured stories
        </span>
        <button
          data-testid="film-ring-sound-toggle"
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? "Mute reel sound" : "Enable reel sound"}
          className="inline-flex items-center gap-2 rounded-sm border border-line px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-bone/50 transition-colors duration-300 hover:border-bone/40 hover:text-bone"
        >
          {soundOn ? <Volume2 size={11} /> : <VolumeX size={11} />}
          {soundOn ? "Reel sound on" : "Reel sound off"}
        </button>
      </div>
    </div>
  );
};
