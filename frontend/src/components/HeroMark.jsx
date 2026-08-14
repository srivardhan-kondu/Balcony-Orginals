import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const buildBGeometry = () => {
  const s = new THREE.Shape();
  s.moveTo(0, -1.3);
  s.lineTo(0, 1.3);
  s.lineTo(0.62, 1.3);
  s.bezierCurveTo(1.45, 1.3, 1.62, 1.0, 1.62, 0.7);
  s.bezierCurveTo(1.62, 0.4, 1.35, 0.18, 0.62, 0.1);
  s.bezierCurveTo(1.55, 0.02, 1.78, -0.3, 1.78, -0.62);
  s.bezierCurveTo(1.78, -1.0, 1.45, -1.3, 0.62, -1.3);
  s.lineTo(0, -1.3);
  const upper = new THREE.Path();
  upper.absellipse(0.95, 0.68, 0.3, 0.3, 0, Math.PI * 2, true);
  const lower = new THREE.Path();
  lower.absellipse(1.0, -0.62, 0.36, 0.34, 0, Math.PI * 2, true);
  s.holes.push(upper, lower);
  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.045,
    bevelSegments: 4,
    curveSegments: 24,
  });
  geo.center();
  return geo;
};

export const HeroMark = ({ className = "" }) => {
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(0, 0, 5.4);

    const key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xcfe0ff, 1.4);
    rim.position.set(-4, -1, -3);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0xffffff, 0.22));

    const chrome = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, metalness: 1, roughness: 0.18 });
    const group = new THREE.Group();
    scene.add(group);

    const bGeo = buildBGeometry();
    group.add(new THREE.Mesh(bGeo, chrome));

    const reelGeo = new THREE.TorusGeometry(0.21, 0.05, 16, 44);
    const hubGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.62, 16);
    const spokeGeo = new THREE.BoxGeometry(0.4, 0.045, 0.045);
    const reelGroups = [];
    [
      [0.06, 0.68],
      [0.11, -0.62],
    ].forEach(([x, y]) => {
      const rg = new THREE.Group();
      rg.add(new THREE.Mesh(reelGeo, chrome));
      const hub = new THREE.Mesh(hubGeo, chrome);
      hub.rotation.x = Math.PI / 2;
      rg.add(hub);
      for (let k = 0; k < 3; k++) {
        const spoke = new THREE.Mesh(spokeGeo, chrome);
        spoke.rotation.z = (Math.PI / 3) * k;
        rg.add(spoke);
      }
      rg.position.set(x, y, 0);
      group.add(rg);
      reelGroups.push(rg);
    });

    const mouse = { x: 0, y: 0 };
    const onMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMouse, { passive: true });

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
      const t = clock.getElapsedTime();
      group.rotation.y += (Math.sin(t * 0.3) * 0.35 + mouse.x * 0.35 - group.rotation.y) * 0.05;
      group.rotation.x += (Math.sin(t * 0.45) * 0.06 - mouse.y * 0.18 - group.rotation.x) * 0.05;
      group.position.y = Math.sin(t * 0.8) * 0.08;
      reelGroups.forEach((r, i) => {
        r.rotation.z = t * (i % 2 ? -1.4 : 1.4);
      });
      key.position.set(Math.cos(t * 0.4) * 4, 3.5, Math.sin(t * 0.4) * 4 + 3);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    if (reduced) renderer.render(scene, camera);
    else raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMouse);
      bGeo.dispose();
      reelGeo.dispose();
      hubGeo.dispose();
      spokeGeo.dispose();
      chrome.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} data-testid="hero-3d-mark" aria-hidden="true" className={className} />;
};
