"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/* The rippling film strip itself. Split out from FilmRibbon so that `three` —
   144KB gzipped across the four WebGL decorations — can be deferred without
   taking the band it sits in with it. Nothing here renders on the server: it
   mounts a <canvas> and paints into it. */

/* The frames on the strip are stills from Proddatur Dussehra. `fit: "contain"`
   shows the whole image: the square poster, so its title is never cropped, and
   the archer still, whose two figures sit at opposite edges. The rest fill
   their frame. */
const FRAMES = [
  { src: "/assets/projects/proddatur-hero-768w.jpg", fit: "contain" },
  { src: "/assets/projects/proddatur-g7-768w.jpg", fit: "contain" },
  { src: "/assets/projects/proddatur-g8-768w.jpg", fit: "cover" },
];

// Strip geometry, kept in one place because the frame maths depends on it.
const STRIP_W = 17; // world units
const STRIP_H = 1.7;
const TEX_W = 3456; // 9 frames, so the 3 stills repeat without two alike side by side
const TEX_H = 448;
const PITCH = TEX_W / 9; // one frame plus its gap
const FRAME = { x: 8, y: 80, w: PITCH - 16, h: 288 };
const REPEAT = 4096 / TEX_W; // keeps the strip at its original scale on screen

// How wide a frame actually looks once the texture is stretched over the strip.
const FRAME_ASPECT =
  (FRAME.w * (STRIP_W / (REPEAT * TEX_W))) / (FRAME.h * (STRIP_H / TEX_H));

const drawStill = (g, img, fit, x) => {
  const { y, w, h } = FRAME;
  g.fillStyle = "#050505";
  g.fillRect(x, y, w, h);
  const imgAspect = img.naturalWidth / img.naturalHeight;
  if (fit === "contain") {
    // Fit the whole image, measured in on-screen proportions.
    const dh = imgAspect > FRAME_ASPECT ? h * (FRAME_ASPECT / imgAspect) : h;
    const dw = imgAspect > FRAME_ASPECT ? w : w * (imgAspect / FRAME_ASPECT);
    g.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  } else {
    // Crop the centre of the image to the frame's on-screen proportions.
    let sw = img.naturalWidth;
    let sh = img.naturalHeight;
    if (imgAspect > FRAME_ASPECT) sw = sh * FRAME_ASPECT;
    else sh = sw / FRAME_ASPECT;
    g.drawImage(img, (img.naturalWidth - sw) / 2, (img.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
  }
  // A faint sheen so the stills read as film rather than flat prints.
  const grd = g.createLinearGradient(x, y, x, y + h);
  grd.addColorStop(0, "rgba(255,255,255,0.06)");
  grd.addColorStop(0.5, "rgba(0,0,0,0)");
  grd.addColorStop(1, "rgba(0,0,0,0.25)");
  g.fillStyle = grd;
  g.fillRect(x, y, w, h);
};

/** Builds the strip; frames start as grey and fill in as each still loads. */
const makeStripTexture = (onUpdate) => {
  const c = document.createElement("canvas");
  c.width = TEX_W;
  c.height = TEX_H;
  const g = c.getContext("2d");
  g.fillStyle = "#0a0a0a";
  g.fillRect(0, 0, TEX_W, TEX_H);
  g.fillStyle = "rgba(236,236,235,0.85)";
  for (let x = 24; x < TEX_W; x += 64) {
    g.fillRect(x, 24, 22, 32);
    g.fillRect(x, TEX_H - 56, 22, 32);
  }
  for (let i = 0; i < 9; i++) {
    const x = i * PITCH + FRAME.x;
    const grd = g.createLinearGradient(x, 0, x + FRAME.w, 0);
    grd.addColorStop(0, "rgba(236,236,235,0.08)");
    grd.addColorStop(0.5, "rgba(236,236,235,0.22)");
    grd.addColorStop(1, "rgba(236,236,235,0.08)");
    g.fillStyle = grd;
    g.fillRect(x, FRAME.y, FRAME.w, FRAME.h);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(REPEAT, 1);
  tex.anisotropy = 4;

  let cancelled = false;
  FRAMES.forEach(({ src, fit }, k) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (cancelled) return;
      for (let i = k; i < 9; i += FRAMES.length) drawStill(g, img, fit, i * PITCH + FRAME.x);
      tex.needsUpdate = true;
      onUpdate();
    };
    img.src = src;
  });

  return { tex, cancel: () => (cancelled = true) };
};

export const FilmRibbonCanvas = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
    camera.position.set(0, 0.1, 4.4);

    // With reduced motion there is no loop, so each loaded still needs its own render.
    const { tex, cancel: cancelStills } = makeStripTexture(() => {
      if (reduced) renderer.render(scene, camera);
    });
    const geo = new THREE.PlaneGeometry(STRIP_W, STRIP_H, 150, 1);
    const base = geo.attributes.position.array.slice();
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const strip = new THREE.Mesh(geo, mat);
    strip.rotation.x = -0.38;
    strip.rotation.z = -0.05;
    scene.add(strip);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.02 });
    io.observe(mount);

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const clock = new THREE.Clock();
    const displace = (t) => {
      const scroll = (window.scrollY || 0) * 0.0022;
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3];
        pos.array[i * 3 + 2] = Math.sin(x * 0.55 + t * 0.5 + scroll) * 0.55;
        pos.array[i * 3 + 1] = base[i * 3 + 1] + Math.cos(x * 0.35 + t * 0.35 + scroll) * 0.22;
      }
      pos.needsUpdate = true;
      tex.offset.x = t * 0.015 + (window.scrollY || 0) * 0.0004;
    };

    const tick = () => {
      if (visible) {
        displace(clock.getElapsedTime());
        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(tick);
    };
    if (reduced) {
      displace(0);
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      cancelStills();
      io.disconnect();
      window.removeEventListener("resize", resize);
      geo.dispose();
      mat.dispose();
      tex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />;
};
