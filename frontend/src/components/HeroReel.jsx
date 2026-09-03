"use client";

import { MotionStill, Still } from "@/components/Still";
import { SIZES } from "@/lib/images";
import { usePrefersReducedMotion } from "@/hooks/use-media-query";

/* ---------------------------------------------------------------------------
   The hero backdrop.

   A production house should lead with what it shot, not with its logo blown up
   to 600px. Until a cut showreel exists, the next most honest thing is the work
   itself: a small set of real frames, cross-faded, each drifting slowly enough
   that the frame reads as held rather than panned.

   Pass `video` once a reel is cut and the still cycle steps aside for it. That
   is the whole upgrade path — the scrims, framing and strip below are indifferent
   to which one is playing.
   --------------------------------------------------------------------------- */

/* Kept as a named export because it was one; the subscription itself now lives
   in use-media-query, which states what the server should answer rather than
   guessing at it behind a `typeof window` check. */
export const useReducedMotion = usePrefersReducedMotion;

export const HeroReel = ({ frames = [], index = 0, video, poster, className = "" }) => {
  const reduced = useReducedMotion();

  if (video) {
    return (
      <div className={className} aria-hidden="true" data-testid="hero-reel">
        <video
          src={video}
          poster={poster}
          autoPlay={!reduced}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={className} aria-hidden="true" data-testid="hero-reel">
      {frames.map((f, i) => {
        const active = i === index;
        return (
          /* `portrait`: this frame is 2.36:1 and it is being used full-bleed
             behind a phone screen, where `object-cover` keeps a strip about a
             fifth of its width and discards the rest — after downloading all of
             it. The portrait source is a crop of exactly that strip. */
          <MotionStill
            key={f.src}
            src={f.src}
            sizes={SIZES.full}
            portrait
            // The first frame is the LCP element, so it must not be deferred.
            // The rest are only ever needed after a 6s dwell.
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding="async"
            initial={false}
            animate={
              reduced
                ? { opacity: active ? 1 : 0, scale: 1 }
                : { opacity: active ? 1 : 0, scale: active ? 1.12 : 1.04 }
            }
            transition={
              reduced
                ? { duration: 0 }
                : { opacity: { duration: 1.6, ease: "linear" }, scale: { duration: 9, ease: "linear" } }
            }
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
          />
        );
      })}

    </div>
  );
};

/* The strip doubles as the shot selector: what it shows is what is behind the
   type, so it advertises the archive and steers the backdrop with one control
   rather than two. Same image files as the backdrop, so it costs no extra bytes. */
export const HeroFrameStrip = ({ frames = [], index = 0, onSelect, className = "" }) => (
  <div className={className} data-testid="hero-frame-strip">
    <div className="flex items-center gap-2.5">
      {frames.map((f, i) => (
        <button
          key={f.src}
          type="button"
          onClick={() => onSelect(i)}
          data-testid={`hero-frame-${i}`}
          aria-label={`Show frame from ${f.title}`}
          aria-current={i === index}
          className={`group relative h-[44px] w-[74px] flex-none overflow-hidden rounded-sm border transition-all duration-500 md:h-[54px] md:w-[92px] ${
            i === index
              ? "border-gold opacity-100"
              : "border-bone/25 opacity-60 hover:opacity-90 hover:border-bone/50"
          }`}
        >
          {/* 92px on screen — the smallest rung of the ladder is still four
              times more than this needs, but it is the same file the backdrop
              is already fetching at that size on a phone, so it costs nothing. */}
          <Still
            src={f.src}
            sizes="92px"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </button>
      ))}
    </div>
  </div>
);
