/* ---------------------------------------------------------------------------
   Responsive stills.

   Every project still is authored as one 1584x672 master. `scripts/derive_images.py`
   writes a width ladder and a 3:4 centre crop next to it; this module turns a
   master path back into the `<source>` set that picks the right one.

   Two jobs, and they are separate:

   - Width. A card in a 3-up grid paints at ~480px. Handing it the 1584px master
     downloads five times the bytes and then throws four fifths of the pixels
     away in the decoder.
   - Framing. A 2.36:1 frame used full-bleed behind a portrait phone is cropped
     to a narrow vertical slice by `object-cover`. `portrait` swaps in a crop of
     that same slice, so the phone downloads what it can actually see.

   A path this module does not recognise (a logo, an API-supplied URL pointing
   somewhere else) falls through untouched — call sites do not have to know
   which is which.
   --------------------------------------------------------------------------- */

const MASTER = /^(\/assets\/projects\/[a-z0-9-]+)\.jpg$/i;

// Kept in step with scripts/derive_images.py.
const LANDSCAPE_WIDTHS = [480, 768, 1200, 1584];
const PORTRAIT_WIDTHS = [360, 504];

/* Phones held upright, which is where the wide master is cropped hardest. A
   phone in landscape wants the landscape frame, so orientation is part of it. */
export const PORTRAIT_MEDIA = "(max-width: 700px) and (orientation: portrait)";

/* Common `sizes` values. A wrong `sizes` is worse than none — the browser
   commits to a width before layout, so it is stated per call site. */
export const SIZES = {
  full: "100vw",
  // sm:grid-cols-2 lg:grid-cols-3 inside the 1560px column
  grid3: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  // the screening-room track: w-[80vw] md:w-[44vw] lg:w-[34vw]
  strip: "(min-width: 1024px) 34vw, (min-width: 768px) 44vw, 80vw",
  // one card beside a column of copy
  half: "(min-width: 1024px) 50vw, 100vw",
  // SlateFocus panel: lg:grid-cols-[1fr_1.15fr]
  slate: "(min-width: 1024px) 55vw, 100vw",
  // FilmRing panel: clamp(230px, 60vw, 470px)
  ring: "(min-width: 784px) 470px, 60vw",
};

const srcSet = (stem, widths, prefix = "", ext = "jpg") =>
  widths.map((w) => `${stem}-${prefix}${w}w.${ext} ${w}w`).join(", ");

/**
 * Build the `<picture>` inputs for a master still.
 *
 * @returns `{ sources, imgProps }` — spread `imgProps` onto the `<img>` (or
 *   `motion.img`) and render `sources` before it. `sources` is empty and
 *   `imgProps` is just `{ src }` for anything that is not a known master, so
 *   the same call site handles both.
 */
export const responsiveImage = (src, sizes = SIZES.full, { portrait = false } = {}) => {
  const match = typeof src === "string" ? src.match(MASTER) : null;
  if (!match) return { sources: [], imgProps: { src } };

  const stem = match[1];
  const sources = [];

  if (portrait) {
    sources.push(
      {
        key: "portrait-webp",
        media: PORTRAIT_MEDIA,
        type: "image/webp",
        srcSet: srcSet(stem, PORTRAIT_WIDTHS, "p", "webp"),
        sizes: "100vw",
      },
      {
        key: "portrait-jpg",
        media: PORTRAIT_MEDIA,
        srcSet: srcSet(stem, PORTRAIT_WIDTHS, "p", "jpg"),
        sizes: "100vw",
      }
    );
  }

  sources.push({
    key: "webp",
    type: "image/webp",
    srcSet: srcSet(stem, LANDSCAPE_WIDTHS, "", "webp"),
    sizes,
  });

  return {
    sources,
    imgProps: {
      src: `${stem}-1200w.jpg`,
      srcSet: srcSet(stem, LANDSCAPE_WIDTHS, "", "jpg"),
      sizes,
    },
  };
};
