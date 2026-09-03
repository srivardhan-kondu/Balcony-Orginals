"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Additive blending against near-black: the motes read as embers drifting in a
// dark room, and the shafts as light picking them out.
const PALETTE = {
  fog: 0x050505,
  blending: THREE.AdditiveBlending,
  embers: { color: 0xe6e6e6, opacity: 0.8 },
  dust: { color: 0x6e6e6e, opacity: 0.22 },
  shaft: { color: 0xe6e6e6, opacity: 0.035, step: 0.012 },
};

export const WebGLHero = ({ className = "" }) => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    } catch (e) {
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(PALETTE.fog, 0.045);
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0.4, 8.5);

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    // Golden embers rising
    const COUNT = 850;
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 13;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      speeds[i] = 0.0015 + Math.random() * 0.0045;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const embers = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        color: PALETTE.embers.color,
        size: 0.045,
        transparent: true,
        opacity: PALETTE.embers.opacity,
        blending: PALETTE.blending,
        depthWrite: false,
      })
    );
    scene.add(embers);

    // Dim dust layer behind
    const COUNT2 = 420;
    const pos2 = new Float32Array(COUNT2 * 3);
    for (let i = 0; i < COUNT2; i++) {
      pos2[i * 3] = (Math.random() - 0.5) * 30;
      pos2[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos2[i * 3 + 2] = -4 - Math.random() * 10;
    }
    const geo2 = new THREE.BufferGeometry();
    geo2.setAttribute("position", new THREE.BufferAttribute(pos2, 3));
    const dust = new THREE.Points(
      geo2,
      new THREE.PointsMaterial({
        color: PALETTE.dust.color,
        size: 0.11,
        transparent: true,
        opacity: PALETTE.dust.opacity,
        blending: PALETTE.blending,
        depthWrite: false,
      })
    );
    scene.add(dust);

    // Slow light shafts
    const shaftGeo = new THREE.PlaneGeometry(1.4, 24);
    const shaftTilts = [0.35, 0.2, 0.3];
    const shafts = shaftTilts.map((tilt, i) => {
      const m = new THREE.Mesh(
        shaftGeo,
        new THREE.MeshBasicMaterial({
          color: PALETTE.shaft.color,
          transparent: true,
          opacity: PALETTE.shaft.opacity + i * PALETTE.shaft.step,
          blending: PALETTE.blending,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      m.position.set(-4.5 + i * 3.5, 1, -3.5 - i);
      m.rotation.z = tilt;
      scene.add(m);
      return m;
    });

    const mouse = { x: 0, y: 0 };
    const onMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMouse, { passive: true });

    let lastW = 0;
    let lastH = 0;
    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h || (w === lastW && h === lastH)) return;
      lastW = w;
      lastH = h;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // setSize clears the drawing buffer. With reduced motion there is no
      // animation loop to redraw it, so a resize would otherwise leave the
      // canvas permanently blank.
      if (reduced) renderer.render(scene, camera);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let raf = 0;
    const clock = new THREE.Clock();
    const tick = () => {
      const t = clock.getElapsedTime();
      const arr = geo.attributes.position.array;
      for (let i = 0; i < COUNT; i++) {
        let y = arr[i * 3 + 1] + speeds[i];
        if (y > 6.8) y = -6.8;
        arr[i * 3 + 1] = y;
        arr[i * 3] += Math.sin(t * 0.4 + i) * 0.0009;
      }
      geo.attributes.position.needsUpdate = true;
      embers.rotation.y = t * 0.015;
      dust.rotation.y = -t * 0.008;
      camera.position.x += (mouse.x * 1.1 - camera.position.x) * 0.03;
      camera.position.y += (-mouse.y * 0.6 + 0.4 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);
      shafts.forEach((s, i) => {
        s.rotation.z = shaftTilts[i] + Math.sin(t * 0.12 + i * 1.7) * 0.05;
      });
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    if (reduced) renderer.render(scene, camera);
    else raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onMouse);
      geo.dispose();
      geo2.dispose();
      embers.material.dispose();
      dust.material.dispose();
      shaftGeo.dispose();
      shafts.forEach((s) => s.material.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} aria-hidden="true" data-testid="webgl-hero-canvas" className={className} />;
};
