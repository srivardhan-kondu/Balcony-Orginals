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
  const rot = useRef(0);
  const vel = useRef(0.1);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const moved = useRef(0);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const soundRef = useRef(isSoundEnabled());
  const audioRef = useRef(null);
  const [radius, setRadius] = useState(520);
  const radiusRef = useRef(520);
  radiusRef.current = radius;

  useEffect(() => {
    const fit = () => setRadius(Math.max(270, Math.min(520, window.innerWidth * 0.36)));
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
        // friction, then settle into a slow cruise — weighty glide
        vel.current *= 0.965;
        vel.current += (0.09 - vel.current) * 0.008;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(-50%, -50%) translateZ(${-radiusRef.current}px) rotateX(-4deg) rotateY(${rot.current}deg)`;
      }
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
      const a = audioRef.current;
      if (a) {
        try {
          a.src.stop();
        } catch {}
        a.gain.disconnect();
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
    rot.current += dx * 0.16;
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
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <span
          data-testid="film-ring-hint"
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-bone/40"
        >
          Drag to rotate · {projects.length} featured stories
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
