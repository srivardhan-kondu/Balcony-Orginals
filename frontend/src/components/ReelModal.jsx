"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useOverlay } from "@/hooks/use-overlay";

export const ReelModal = ({ open, onClose, label = "BRAND FILM" }) => {
  const ref = useRef(null);
  // Scroll lock, Lenis, Escape, and the focus trap — see use-overlay.
  useOverlay(open, onClose, ref);

  if (!open) return null;

  return createPortal(
    <div
      ref={ref}
      data-testid="reel-modal"
      onClick={onClose}
      tabIndex={-1}
      className="fixed inset-0 z-[150] flex cursor-pointer items-center justify-center bg-scrim/95 p-[clamp(20px,5vw,80px)]"
      role="dialog"
      aria-modal="true"
      aria-label={`Video player — ${label}`}
    >
      <div className="w-[min(1000px,92vw)]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3.5 flex items-end justify-between gap-4">
          <span className="font-mono text-[10.5px] tracking-[0.2em] text-mute">{label}</span>
          {/* Click-anywhere was the only way out, which is no way out from a
              keyboard. Escape closes it too; this is the visible affordance. */}
          <button
            type="button"
            onClick={onClose}
            data-testid="reel-close-btn"
            aria-label="Close video"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-sm border border-bone/25 px-3 text-[11px] uppercase tracking-[0.16em] text-bone/80 transition-colors hover:border-gold hover:text-gold"
          >
            <X size={13} />
            Close
          </button>
        </div>
        <video
          src="/assets/balcony-intro.mp4"
          poster="/assets/intro-poster.jpg"
          autoPlay
          controls
          playsInline
          className="block w-full cursor-auto bg-ink"
          style={{ filter: "invert(1) brightness(.97) contrast(1.9)", mixBlendMode: "screen" }}
          data-testid="reel-video"
        />
      </div>
    </div>,
    document.body
  );
};
