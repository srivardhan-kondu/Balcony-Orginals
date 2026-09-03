"use client";

import { useEffect, useRef, useState } from "react";

export const CursorPreview = () => {
  const [img, setImg] = useState(null);
  const wrapRef = useRef(null);
  const pos = useRef({ x: -400, y: -400 });
  const target = useRef({ x: -400, y: -400 });
  const rot = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onOver = (e) => {
      const row = e.target.closest ? e.target.closest("[data-preview]") : null;
      setImg(row ? row.getAttribute("data-preview") : null);
    };
    const onMove = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mousemove", onMove, { passive: true });
    let raf;
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.11;
      pos.current.y += (target.current.y - pos.current.y) * 0.11;
      const dx = target.current.x - pos.current.x;
      rot.current += (Math.max(-9, Math.min(9, dx * 0.05)) - rot.current) * 0.09;
      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate3d(${pos.current.x + 26}px, ${pos.current.y - 140}px, 0) rotate(${rot.current.toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      data-testid="cursor-preview"
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[85] hidden md:block"
    >
      <div
        className={`relative h-[190px] w-[290px] overflow-hidden rounded-sm border border-bone/25 bg-ink shadow-2xl transition-all duration-300 ${
          img ? "scale-100 opacity-100" : "scale-90 opacity-0"
        }`}
      >
        {img && <img src={img} alt="" className="h-full w-full object-cover" />}
        <span className="absolute left-2 top-2 h-3 w-3 border-l border-t border-bone/50" />
        <span className="absolute right-2 top-2 h-3 w-3 border-r border-t border-bone/50" />
        <span className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-bone/50" />
        <span className="absolute bottom-2 right-2 h-3 w-3 border-b border-r border-bone/50" />
      </div>
    </div>
  );
};
