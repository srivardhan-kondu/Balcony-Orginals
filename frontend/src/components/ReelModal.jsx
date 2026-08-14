import { useEffect } from "react";
import { createPortal } from "react-dom";

export const ReelModal = ({ open, onClose, label = "BRAND FILM" }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      data-testid="reel-modal"
      onClick={onClose}
      className="fixed inset-0 z-[150] flex cursor-pointer items-center justify-center bg-[#060605]/95 p-[clamp(20px,5vw,80px)]"
      role="dialog"
      aria-label="Video player"
    >
      <div className="w-[min(1000px,92vw)]">
        <div className="mb-3.5 flex items-end justify-between">
          <span className="font-mono text-[10.5px] tracking-[0.2em] text-bone/45">{label}</span>
          <span className="text-[11px] uppercase tracking-[0.16em] text-bone/50">Click anywhere to close</span>
        </div>
        <video
          src="/assets/balcony-intro.mp4"
          poster="/assets/intro-poster.jpg"
          autoPlay
          controls
          playsInline
          onClick={(e) => e.stopPropagation()}
          className="block w-full bg-ink"
          style={{ filter: "invert(1) brightness(.97) contrast(1.9)", mixBlendMode: "screen" }}
          data-testid="reel-video"
        />
      </div>
    </div>,
    document.body
  );
};
