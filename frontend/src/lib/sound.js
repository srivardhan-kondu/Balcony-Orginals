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

/* A xenon projector lamp striking: the relay clunks, the arc catches and
   brightens, then the transport settles to 24fps and dies away. Fired the
   instant the beam appears.

   The original design opened its own AudioContext and armed a gesture listener
   to get around autoplay blocking. Here it goes through the shared context and
   the site-wide sound preference instead — one mute switch for the whole site,
   and no audio before the visitor has asked for any. */
export const playLamp = () => {
  if (!enabled) return;
  const c = getAudioContext();
  if (!c || !master || c.state !== "running") return;
  const t = c.currentTime + 0.02;

  const relay = c.createOscillator();
  relay.type = "sine";
  relay.frequency.setValueAtTime(150, t);
  relay.frequency.exponentialRampToValueAtTime(46, t + 0.2);
  const rg = c.createGain();
  rg.gain.setValueAtTime(0.0001, t);
  rg.gain.exponentialRampToValueAtTime(0.42, t + 0.01);
  rg.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  relay.connect(rg);
  rg.connect(master);
  relay.start(t);
  relay.stop(t + 0.32);

  const arc = c.createBufferSource();
  arc.buffer = makeNoiseBuffer(c, 2);
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.Q.value = 0.9;
  bp.frequency.setValueAtTime(320, t);
  bp.frequency.exponentialRampToValueAtTime(2600, t + 0.18);
  bp.frequency.exponentialRampToValueAtTime(700, t + 1.1);
  const ag = c.createGain();
  ag.gain.setValueAtTime(0.0001, t);
  ag.gain.exponentialRampToValueAtTime(0.3, t + 0.06);
  ag.gain.exponentialRampToValueAtTime(0.0001, t + 1.9);

  // 24Hz tremolo on the arc — the shutter, felt rather than heard.
  const flutter = c.createOscillator();
  flutter.type = "triangle";
  flutter.frequency.value = 24;
  const fAmt = c.createGain();
  fAmt.gain.value = 0.12;
  flutter.connect(fAmt);
  fAmt.connect(ag.gain);

  arc.connect(bp);
  bp.connect(ag);
  ag.connect(master);
  arc.start(t);
  arc.stop(t + 2);
  flutter.start(t);
  flutter.stop(t + 2);
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
