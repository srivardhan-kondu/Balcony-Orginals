"use client";

import { useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, Volume2 } from "lucide-react";
import { useOverlay } from "@/hooks/use-overlay";

/* ---------------------------------------------------------------------------
   Extracts a YouTube video ID from any canonical YouTube URL shape.
   Returns null for local paths (e.g. /assets/videos/...).
   --------------------------------------------------------------------------- */
function youtubeId(url) {
  if (!url || url.startsWith("/")) return null;
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1).split("?")[0];
    if (u.hostname.includes("youtube.com")) {
      return (
        u.searchParams.get("v") ||
        u.pathname.split("/embed/")[1]?.split("?")[0] ||
        null
      );
    }
  } catch { /* not a URL */ }
  return null;
}

/* ---------------------------------------------------------------------------
   Netflix-style full-screen video modal.

   Supports two modes, auto-detected from the `trailer` prop:

   1. LOCAL VIDEO  (/assets/videos/…mp4)
      → Native <video> element, plays inline, no third-party dependency.
      This is the preferred mode — full autoplay, full controls, served
      directly from the static asset server.

   2. YOUTUBE URL  (youtu.be / youtube.com)
      → Shows the YouTube thumbnail + a play button that opens the video
      in a new tab (in-page embedding may be blocked by the rights holder).
   --------------------------------------------------------------------------- */
export const ReelModal = ({
  open,
  onClose,
  label = "BRAND FILM",
  trailer,   // local path OR YouTube URL
  src,       // fallback local path if no trailer
  poster,
}) => {
  const ref = useRef(null);
  useOverlay(open, onClose, ref);

  const ytId = useMemo(() => youtubeId(trailer), [trailer]);

  // Local video: trailer itself is a local path, or fall back to src prop
  const localSrc = !ytId ? (trailer || src || "/assets/balcony-intro.mp4") : null;
  const localPoster = poster || "/assets/intro-poster.jpg";

  // YouTube fallback data
  const thumbUrl  = ytId ? `https://i.ytimg.com/vi/${ytId}/maxresdefault.jpg` : null;
  const ytWatchUrl = ytId ? `https://www.youtube.com/watch?v=${ytId}` : null;

  if (!open) return null;

  return createPortal(
    <div
      ref={ref}
      data-testid="reel-modal"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`Video player — ${label}`}
      onClick={onClose}
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center"
      style={{ background: "rgba(0,0,0,0.97)", animation: "reelFadeIn .22s ease both" }}
    >
      {/* ── Film-strip top bar ── */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[3px]"
        style={{
          background: "repeating-linear-gradient(90deg,#c9a84c 0,#c9a84c 18px,transparent 18px,transparent 28px)",
          opacity: 0.7,
        }}
      />

      {/* ── Scan-line vignette ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "repeating-linear-gradient(0deg,rgba(0,0,0,.13) 0px,rgba(0,0,0,.13) 1px,transparent 1px,transparent 3px)",
          mixBlendMode: "multiply",
        }}
      />

      {/* ── Centre panel ── */}
      <div
        className="relative flex w-full flex-col"
        style={{ maxWidth: "min(1200px, 95vw)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Title bar ── */}
        <div className="mb-3 flex items-center justify-between gap-4 px-1">
          <div className="flex items-center gap-3">
            <div className="flex gap-[3px] opacity-50">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="block h-[10px] w-[7px] rounded-[1px] bg-white/30" />
              ))}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/50">
              {label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {localSrc && (
              <span className="hidden items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-white/35 sm:flex">
                <Volume2 size={10} className="opacity-60" />
                Playing
              </span>
            )}
            <button
              type="button"
              onClick={onClose}
              data-testid="reel-close-btn"
              aria-label="Close video"
              className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center gap-2 rounded-sm border border-white/15 px-3 text-[11px] uppercase tracking-[0.16em] text-white/60 transition-all duration-200 hover:border-[#c9a84c] hover:text-[#c9a84c]"
            >
              <X size={12} />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* ── 16:9 player ── */}
        <div
          className="relative w-full overflow-hidden rounded-[2px] bg-black"
          style={{
            aspectRatio: "16/9",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 40px 120px rgba(0,0,0,0.9), 0 0 80px rgba(201,168,76,0.07)",
            animation: "reelSlideUp .28s cubic-bezier(.2,.9,.25,1) both",
          }}
        >
          {localSrc ? (
            /* ── Native inline video player — served from static assets ── */
            <video
              key={localSrc}
              src={localSrc}
              poster={localPoster}
              autoPlay
              controls
              playsInline
              preload="auto"
              className="absolute inset-0 h-full w-full cursor-auto bg-black object-contain"
              data-testid="reel-video"
            />
          ) : (
            /* ── YouTube fallback — thumbnail + open-on-YouTube ── */
            <div className="absolute inset-0">
              <img
                src={thumbUrl}
                alt={label}
                className="h-full w-full object-cover"
                onError={(e) => { e.target.src = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
              <button
                type="button"
                onClick={() => window.open(ytWatchUrl, "_blank", "noopener,noreferrer")}
                className="group absolute inset-0 flex flex-col items-center justify-center gap-4"
                aria-label="Watch on YouTube"
              >
                <div
                  className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-white/80 transition-all duration-300 group-hover:scale-110 group-hover:border-[#c9a84c] group-hover:shadow-[0_0_40px_rgba(201,168,76,0.35)]"
                  style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)" }}
                >
                  <div style={{ width:0, height:0, borderTop:"14px solid transparent", borderBottom:"14px solid transparent", borderLeft:"22px solid white", marginLeft:"5px" }} />
                </div>
                <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/70 transition-colors group-hover:text-[#c9a84c]">
                  Watch on YouTube
                </span>
              </button>
            </div>
          )}

          {/* Corner frame ticks */}
          <span className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l border-t border-[#c9a84c]/30" />
          <span className="pointer-events-none absolute right-0 top-0 h-5 w-5 border-r border-t border-[#c9a84c]/30" />
          <span className="pointer-events-none absolute bottom-0 left-0 h-5 w-5 border-b border-l border-[#c9a84c]/30" />
          <span className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b border-r border-[#c9a84c]/30" />
        </div>

        {/* ── Bottom strip ── */}
        <div className="mt-3 flex items-center justify-between px-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.26em] text-white/20">
            Balcony Originals · Rayalaseema
          </span>
          <div className="flex gap-[3px] opacity-25">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="block h-[10px] w-[7px] rounded-[1px] bg-white/30" />
            ))}
          </div>
        </div>
      </div>

      {/* Keyboard hint */}
      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/15">
        Press Esc or click outside to close
      </p>

      <style>{`
        @keyframes reelFadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes reelSlideUp { from { opacity: 0; transform: translateY(18px) scale(.98) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>,
    document.body
  );
};
