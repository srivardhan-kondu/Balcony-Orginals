/* ---------------------------------------------------------------------------
   The projection timeline.

   The hero opens in two acts, and the boundary between them is the whole point:

     ACT ONE — THE LIGHT.  The screen is black. Nothing is on it: no type, no
       nav, no frame, no telemetry. The lamp strikes behind the mark, flares,
       and throws its cone down the page. Only light moves.

     — the beat —  The beam is fully open and the room is lit. Nothing happens
       for most of a second. This pause is what makes the two acts read as two
       acts rather than one continuous fade-in; without it the first line of
       type arrives while the cone is still opening and the whole thing reads
       as a single soft blur.

     ACT TWO — THE TYPE.  The headline rises into the light a line at a time,
       then the eyebrow, the copy, the buttons, and last the chrome.

   Every delay below is seconds after `--bp-t0` (the initial black hold), and is
   consumed as `calc(var(--bp-t0) + Xs)`. They live here rather than inline in
   six components so the running order is legible in one place — and so the beat
   cannot be quietly closed up by editing one component's delay.
   --------------------------------------------------------------------------- */

/* --- Act one: the light ------------------------------------------------- */
const LAMP = 0; // the mark ignites
const STRIKE = 0.04; // the flare at the lamp
const BEAM_START = 0.06; // the cone starts to open
const BEAM_DURATION = 0.95; // ...and is fully thrown this long after
const WASH = 0.35; // the room lifts off black
const SCAN = 1.0; // scanlines settle in
const MOTES = 1.1; // dust starts falling through the beam

/** The moment the light has finished arriving. Act two is measured from here. */
export const BEAM_OPEN = BEAM_START + BEAM_DURATION;

/**
 * Held, fully lit, with nothing moving — the gap between the two acts.
 *
 * This is the one number that decides how separated they read. It does not need
 * to be long: the beam takes ~1s to open with nothing else on screen, so the
 * light already has the stage to itself for well over a second before the beat
 * even begins. Widen it to draw the acts further apart, narrow it to tighten
 * the whole entrance — everything in act two moves with it.
 */
export const BEAT = 0.45;

/* --- Act two: the type -------------------------------------------------- */
const COPY = BEAM_OPEN + BEAT;
const STEP = 0.11; // gap between headline lines

export const T = {
  lamp: LAMP,
  strike: STRIKE,
  beam: BEAM_START,
  beamDuration: BEAM_DURATION,
  // The flicker only makes sense once there is a steady beam to disturb.
  flicker: BEAM_OPEN + 0.4,
  wash: WASH,
  scan: SCAN,
  motes: MOTES,

  /* The cascade is deliberately quick. Once the type has started arriving the
     reader is reading, and every extra beat between the headline and the button
     underneath it is time spent watching a page assemble itself. */
  line1: COPY,
  line2: COPY + STEP,
  line3: COPY + STEP * 2,
  eyebrow: COPY + 0.38,
  sub: COPY + 0.5,
  cta: COPY + 0.62,
  // Chrome last: the frame, the nav links and the readout are the room, not the
  // picture, and they should not compete with the headline for the eye.
  frame: COPY + 0.72,
  nav: COPY + 0.8,
  telemetry: COPY + 0.9,
  replay: COPY + 1.0,
};

/** `calc(var(--bp-t0) + 1.86s)` — a delay on the shared clock. */
export const at = (seconds) => `calc(var(--bp-t0) + ${seconds.toFixed(2)}s)`;

/** `calc(0.95s / var(--bp-spd))` — a duration scaled by the speed prop. */
export const over = (seconds) => `calc(${seconds}s / var(--bp-spd))`;

/**
 * An inline animation that honours the stage's pause.
 *
 * `animation` is a shorthand, and a shorthand resets every longhand it covers —
 * including `animation-play-state`, back to `running`. Setting it inline
 * therefore overrides any stylesheet rule trying to hold the timeline, however
 * specific that rule is. The play state has to be re-stated inline, after the
 * shorthand, on every animated element. Miss one and it starts on its own.
 *
 * Getting this wrong is not visible in a still: the sequence simply runs while
 * the splash is still covering the screen, and by the time the page is uncovered
 * the whole thing has already happened.
 *
 * Key order matters — `animationPlayState` must come after `animation`.
 */
export const anim = (value) => ({
  animation: value,
  animationPlayState: "var(--bp-run)",
});
