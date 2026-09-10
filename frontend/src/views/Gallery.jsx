"use client";

import { useMemo, useState } from "react";
import { Camera } from "lucide-react";
import { Reveal } from "@/components/Motion";
import { Still } from "@/components/Still";
import { SIZES } from "@/lib/images";
import { GALLERY_ITEMS } from "@/lib/gallery";

/* Nothing shot in yet — see lib/gallery.js. Rather than ship a page that looks
   broken with an empty grid, say so, in the same voice as the rest of the
   site, and leave the door visibly open. */
const EmptyState = () => (
  <Reveal
    data-testid="gallery-empty"
    className="mx-auto flex max-w-[560px] flex-col items-center gap-6 rounded-sm border border-dashed border-line py-[clamp(70px,12vh,130px)] text-center"
  >
    <Camera className="text-gold/70" size={28} strokeWidth={1.5} />
    <div>
      <h3 className="font-serif text-[clamp(20px,2.2vw,28px)] text-bone">The gallery is being loaded.</h3>
      <p className="mt-4 max-w-[46ch] text-sm leading-[1.7] text-mute">
        Stills from our shoots, behind-the-scenes moments and the journey so far are on their way. Check back
        soon.
      </p>
    </div>
  </Reveal>
);

export default function Gallery() {
  const categories = useMemo(
    () => ["All", ...new Set(GALLERY_ITEMS.map((item) => item.category).filter(Boolean))],
    []
  );
  const [active, setActive] = useState("All");
  const visible = active === "All" ? GALLERY_ITEMS : GALLERY_ITEMS.filter((item) => item.category === active);

  return (
    <div className="mx-auto max-w-[1560px] px-[var(--bo-gutter)] pb-[clamp(80px,12vh,150px)]">
      {GALLERY_ITEMS.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {categories.length > 2 && (
            <Reveal data-testid="gallery-filters" className="mb-10 flex flex-wrap gap-3">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActive(c)}
                  data-testid={`gallery-filter-${c.toLowerCase()}`}
                  aria-pressed={active === c}
                  className={`rounded-sm border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 ${
                    active === c
                      ? "border-gold bg-gold text-ink"
                      : "border-line text-bone/70 hover:border-gold/50 hover:text-bone"
                  }`}
                >
                  {c}
                </button>
              ))}
            </Reveal>
          )}

          <div data-testid="gallery-grid" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item, i) => (
              <Reveal key={item.src} delay={(i % 6) * 0.06}>
                <figure className="group overflow-hidden rounded-sm border border-line bg-ink2/40">
                  <div className="aspect-[4/3] overflow-hidden">
                    <Still
                      src={item.src}
                      alt={item.alt || ""}
                      sizes={SIZES.grid3}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  {item.caption && (
                    <figcaption className="px-4 py-3 text-xs uppercase tracking-[0.12em] text-mute">
                      {item.caption}
                    </figcaption>
                  )}
                </figure>
              </Reveal>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
