import { useCallback, useEffect } from "react";

/* ---------------------------------------------------------------------------
   Fitting the copy to the beam.

   A projector cone is narrow at the lamp and wide at the screen, so the usable
   width depends on how far down the copy sits. That makes the block's TOP
   offset the variable, not its size: find the highest position at which every
   line already clears the edges of the light, and only start shrinking if the
   block would then run into the telemetry strip at the bottom.

   Two values come out, both written as custom properties on the stage element:

     --bp-pt   how far down to push the copy so the cone is wide enough
     --bp-cs   a scale, applied only if that push would overflow the frame

   Nothing here animates anything. The CSS timeline owns the motion; this owns
   the geometry, and re-runs whenever the box or the fonts change.
   --------------------------------------------------------------------------- */

const MIN_SCALE = 0.86;
const EDGE_PAD = 14; // clearance between a line's edge and the wall of light
const APEX_HALF = 23; // half-width of the beam where it leaves the lamp
const FLOOR_PAD = 62; // telemetry strip + breathing room

/**
 * @param stageRef  the hero root — everything is measured relative to it
 * @param markRef   the lamp mark; the beam apex pins to its bottom edge
 * @param copyRef   the copy block, holding the `[data-fit]` rows
 * @param spread    beam spread prop, as a percentage
 */
export const useProjectionFit = (stageRef, markRef, copyRef, spread = 100) => {
  const measure = useCallback(() => {
    const stage = stageRef.current;
    const mark = markRef.current;
    const copy = copyRef.current;
    if (!stage || !mark || !copy) return;

    // Apex: the point the light leaves from, in stage coordinates.
    const apex = Math.round(
      mark.getBoundingClientRect().bottom - stage.getBoundingClientRect().top
    );
    stage.style.setProperty("--bp-ax", `${apex}px`);

    const width = stage.clientWidth;
    // The stage's own height, not window.innerHeight: on a phone the hero is
    // sized in svh, and the two disagree by the height of the address bar.
    const height = stage.clientHeight;

    const bottomHalf = width * spread * 0.009; // half-width where the beam lands
    const span = Math.max(bottomHalf - APEX_HALF, 1);
    const depth = Math.max(height - apex, 1);
    // Inverse of the cone: the y at which the light is `half` wide.
    const yFor = (half) => apex + (Math.max(half - APEX_HALF, 0) * depth) / span;

    const rows = Array.from(copy.querySelectorAll("[data-fit]"));
    if (!rows.length) return;

    // offsetTop chains up to the copy block, which may not be every row's
    // offsetParent once a row is inside a masked line wrapper.
    const relY = (el) => {
      let y = 0;
      let n = el;
      while (n && n !== copy) {
        y += n.offsetTop;
        n = n.offsetParent;
      }
      return y;
    };

    const padTop = parseFloat(getComputedStyle(copy).paddingTop) || 0;
    const copyTop = copy.offsetTop;
    const measured = rows.map((el) => ({
      mid: relY(el) - padTop + el.offsetHeight / 2,
      half: el.offsetWidth / 2,
    }));

    const last = copy.lastElementChild;
    const baseEnd = relY(last) - padTop + last.offsetHeight;
    const floor = height - FLOOR_PAD;

    let scale = 1;
    let top = 0;
    // Push down, check the floor, shrink, repeat — converges in a few passes.
    for (let i = 0; i < 8; i++) {
      top = 0;
      for (const r of measured) {
        top = Math.max(top, (yFor(r.half * scale + EDGE_PAD) - copyTop) / scale - r.mid);
      }
      top = Math.max(top, 0);
      if (copyTop + (top + baseEnd) * scale <= floor) break;
      const next = Math.max(MIN_SCALE, (scale * (floor - copyTop)) / ((top + baseEnd) * scale));
      if (Math.abs(next - scale) < 0.005) {
        scale = next;
        break;
      }
      scale = next;
    }

    stage.style.setProperty("--bp-cs", scale.toFixed(3));
    stage.style.setProperty("--bp-pt", `${Math.round(top)}px`);
  }, [stageRef, markRef, copyRef, spread]);

  useEffect(() => {
    measure();
    const stage = stageRef.current;
    if (!stage) return;

    // A window `resize` listener misses the two things that actually move these
    // rows: the display font arriving, and the stage box changing without the
    // window doing so.
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    if (copyRef.current) ro.observe(copyRef.current);
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener("orientationchange", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", measure);
    };
  }, [measure, stageRef, copyRef]);

  return measure;
};
