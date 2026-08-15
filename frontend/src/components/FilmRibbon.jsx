import { useEffect, useRef } from "react";
import * as THREE from "three";

const makeStripTexture = () => {
  const c = document.createElement("canvas");
  c.width = 2048;
  c.height = 224;
  const g = c.getContext("2d");
  g.fillStyle = "#0a0a0a";
  g.fillRect(0, 0, 2048, 224);
  g.fillStyle = "rgba(236,236,235,0.85)";
  for (let x = 24; x < 2048; x += 64) {
    g.fillRect(x, 12, 22, 16);
    g.fillRect(x, 224 - 28, 22, 16);
  }
  for (let x = 8; x < 2048; x += 128) {
    const grd = g.createLinearGradient(x, 0, x + 120, 0);
    grd.addColorStop(0, "rgba(236,236,235,0.08)");
    grd.addColorStop(0.5, "rgba(236,236,235,0.22)");
    grd.addColorStop(1, "rgba(236,236,235,0.08)");
    g.fillStyle = grd;
    g.fillRect(x, 40, 118, 144);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(2, 1);
  tex.anisotropy = 4;
  return tex;
};

export const FilmRibbon = () => {
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

    const tex = makeStripTexture();
    const geo = new THREE.PlaneGeometry(17, 1.7, 150, 1);
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
      io.disconnect();
      window.removeEventListener("resize", resize);
      geo.dispose();
      mat.dispose();
      tex.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  // bo-dark: the strip texture is a physical film negative — dark base, bright
  // frames. Keeping the whole band dark makes it a film strip laid on the page
  // in the light theme, rather than a negative nobody can read.
  return (
    <section
      data-testid="film-ribbon"
      className="bo-dark relative h-[34vh] overflow-hidden border-y border-line bg-ink md:h-[42vh]"
    >
      <div ref={mountRef} className="absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink" />
      <div className="pointer-events-none absolute bottom-5 left-[clamp(18px,4vw,58px)] font-mono text-[9.5px] tracking-[0.26em] text-bone/40">
        EVERY FRAME, A PLACE · 35 MM
      </div>
      <div className="pointer-events-none absolute right-[clamp(18px,4vw,58px)] top-5 font-mono text-[9.5px] tracking-[0.26em] text-bone/40">
        SCROLL ROLLS THE FILM
      </div>
    </section>
  );
};
