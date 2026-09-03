"use client";

import dynamic from "next/dynamic";

/* The band, which is server-rendered, and the canvas inside it, which is not.

   The section owns a real slice of the page — a bordered 34-42vh band with a
   caption in each corner — so it is laid out with the rest of the page and is
   in the delivered HTML. The film strip rippling through it is decoration that
   costs `three`, and it arrives when it arrives. Splitting them this way means
   deferring the WebGL never leaves a hole in the layout. */
const FilmRibbonCanvas = dynamic(
  () => import("@/components/FilmRibbonCanvas").then((m) => m.FilmRibbonCanvas),
  { ssr: false }
);

export const FilmRibbon = () => (
  <section
    data-testid="film-ribbon"
    className="relative h-[34vh] overflow-hidden border-y border-line bg-ink md:h-[42vh]"
  >
    <FilmRibbonCanvas />
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink" />
    <div className="pointer-events-none absolute bottom-5 left-[var(--bo-gutter)] font-mono text-[10px] tracking-[0.26em] text-dim">
      EVERY FRAME, A PLACE · 35 MM
    </div>
    <div className="pointer-events-none absolute right-[var(--bo-gutter)] top-5 font-mono text-[10px] tracking-[0.26em] text-dim">
      SCROLL ROLLS THE FILM
    </div>
  </section>
);
