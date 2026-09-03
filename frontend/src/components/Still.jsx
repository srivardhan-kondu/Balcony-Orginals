"use client";

import { motion } from "framer-motion";
import { responsiveImage, SIZES } from "@/lib/images";

/* `display: contents` — a <picture> that laid out as a box would sit between
   the image and its positioned parent, and every `h-full` / `absolute inset-0`
   still in the app would resolve against the wrong element. This way the <img>
   keeps its original place in the layout and only its source selection changes. */
const Picture = ({ sources, children }) => (
  <picture className="contents">
    {sources.map(({ key, ...rest }) => (
      <source key={key} {...rest} />
    ))}
    {children}
  </picture>
);

/**
 * A project still, served at the width it is painted at.
 *
 * `sizes` is required in spirit — pass the one from `SIZES` that matches the
 * layout, or a literal. `portrait` additionally swaps in the 3:4 crop on phones
 * held upright, for stills used full-bleed.
 */
export const Still = ({ src, alt = "", sizes = SIZES.full, portrait = false, ...rest }) => {
  const { sources, imgProps } = responsiveImage(src, sizes, { portrait });
  return (
    <Picture sources={sources}>
      <img alt={alt} {...imgProps} {...rest} />
    </Picture>
  );
};

/** The same, for stills framer-motion animates. */
export const MotionStill = ({ src, alt = "", sizes = SIZES.full, portrait = false, ...rest }) => {
  const { sources, imgProps } = responsiveImage(src, sizes, { portrait });
  return (
    <Picture sources={sources}>
      <motion.img alt={alt} {...imgProps} {...rest} />
    </Picture>
  );
};
