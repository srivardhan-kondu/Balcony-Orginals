let ctx = null;
let master = null;
let enabled = false;
const listeners = new Set();

export const isSoundEnabled = () => enabled;

export const subscribeSound = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const getAudioContext = () => {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 1;
  master.connect(ctx.destination);
  return ctx;
};

export const getMaster = () => master;

export const setSoundEnabled = async (v) => {
  enabled = v;
  if (v) {
    const c = getAudioContext();
    if (c && c.state === "suspended") {
      try {
        await c.resume();
      } catch {}
    }
  }
  listeners.forEach((fn) => fn(enabled));
};

const makeNoiseBuffer = (c, seconds) => {
  const len = Math.floor(c.sampleRate * seconds);
  const buffer = c.createBuffer(1, len, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
};

export const playClap = () => {
  if (!enabled) return;
  const c = getAudioContext();
  if (!c || !master || c.state !== "running") return;
  const t0 = c.currentTime;

  // three rapid filtered noise pulses — the "clap" crack
  [0, 0.012, 0.026].forEach((off, i) => {
    const src = c.createBufferSource();
    src.buffer = makeNoiseBuffer(c, 0.3);
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1400;
    bp.Q.value = 1.4;
    const g = c.createGain();
    const peak = i === 2 ? 0.5 : 0.22;
    g.gain.setValueAtTime(0.0001, t0 + off);
    g.gain.linearRampToValueAtTime(peak, t0 + off + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + off + (i === 2 ? 0.22 : 0.035));
    src.connect(bp);
    bp.connect(g);
    g.connect(master);
    src.start(t0 + off);
    src.stop(t0 + off + 0.32);
  });

  // low body thump
  const osc = c.createOscillator();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(180, t0);
  osc.frequency.exponentialRampToValueAtTime(70, t0 + 0.12);
  const og = c.createGain();
  og.gain.setValueAtTime(0.25, t0);
  og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.14);
  osc.connect(og);
  og.connect(master);
  osc.start(t0);
  osc.stop(t0 + 0.16);
};
