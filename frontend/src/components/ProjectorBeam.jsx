"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// A projector beam is light thrown into a dark room, so the cone and its dust
// are additive white against the black of the page.
const PALETTE = {
  blending: THREE.AdditiveBlending,
  cone: { color: 0xffffff, opacity: 0.075 },
  dust: { color: 0xffffff, opacity: 0.55 },
};

export const ProjectorBeam = ({ className = "" }) => {
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
    camera.position.set(0, 0, 5.2);

    // volumetric-feel beam: open cone, additive, from upper right toward lower left
    const beamGroup = new THREE.Group();
    beamGroup.position.set(2.6, 2.0, 0);
    beamGroup.rotation.z = 0.72;
    scene.add(beamGroup);

    const coneGeo = new THREE.CylinderGeometry(0.05, 1.7, 7.5, 32, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: PALETTE.cone.color,
      transparent: true,
      opacity: PALETTE.cone.opacity,
      blending: PALETTE.blending,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.y = -3.75;
    beamGroup.add(cone);

    // dust drifting inside the beam
    const COUNT = 130;
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      const h = -Math.random() * 7.2;
      const r = (Math.abs(h) / 7.5) * 1.5 * Math.random();
      const a = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(a) * r;
      positions[i * 3 + 1] = h;
      positions[i * 3 + 2] = Math.sin(a) * r * 0.6;
      seeds[i] = Math.random() * Math.PI * 2;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({
        color: PALETTE.dust.color,
        size: 0.03,
        transparent: true,
        opacity: PALETTE.dust.opacity,
        blending: PALETTE.blending,
        depthWrite: false,
      })
    );
    beamGroup.add(dust);

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
    const tick = () => {
      if (visible) {
        const t = clock.getElapsedTime();
        beamGroup.rotation.z = 0.72 + Math.sin(t * 0.16) * 0.05;
        const arr = dustGeo.attributes.position.array;
        for (let i = 0; i < COUNT; i++) {
          arr[i * 3] += Math.sin(t * 0.5 + seeds[i]) * 0.0009;
          arr[i * 3 + 1] += 0.0012;
          if (arr[i * 3 + 1] > 0) arr[i * 3 + 1] = -7.2;
        }
        dustGeo.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(tick);
    };
    if (reduced) renderer.render(scene, camera);
    else raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      coneGeo.dispose();
      coneMat.dispose();
      dustGeo.dispose();
      dust.material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} data-testid="projector-beam-3d" aria-hidden="true" className={className} />;
};
