import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MaskLines, Reveal } from "@/components/Motion";

export default function NotFound() {
  useEffect(() => {
    document.title = "404 — Balcony Originals";
  }, []);

  return (
    <div
      data-testid="not-found-page"
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <span aria-hidden="true" className="absolute left-[26px] top-[96px] h-9 w-9 border-l border-t border-gold/40" />
      <span aria-hidden="true" className="absolute right-[26px] top-[96px] h-9 w-9 border-r border-t border-gold/40" />
      <span aria-hidden="true" className="absolute bottom-[26px] left-[26px] h-9 w-9 border-b border-l border-gold/40" />
      <span aria-hidden="true" className="absolute bottom-[26px] right-[26px] h-9 w-9 border-b border-r border-gold/40" />

      <div className="font-mono text-[clamp(60px,10vw,140px)] leading-none tracking-[0.1em] text-bone/[0.08]">
        404
      </div>
      <h1 className="mt-2 max-w-[22ch] font-display font-extrabold uppercase text-[clamp(28px,4.6vw,62px)] leading-[1.02] tracking-[-0.015em] text-bone">
        <MaskLines lines={["This story hasn't", "been told yet."]} delay={0.1} lastClassName="text-sand" />
      </h1>
      <Reveal delay={0.45}>
        <p className="mt-6 font-mono text-[10.5px] uppercase tracking-[0.24em] text-mute">
          SCENE NOT FOUND · REEL MISLABELLED
        </p>
        <Link
          to="/"
          data-testid="404-go-home-btn"
          className="mt-10 inline-block rounded-sm bg-bone px-8 py-4 text-xs font-medium uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-gold"
        >
          Return to the archive
        </Link>
      </Reveal>
    </div>
  );
}
