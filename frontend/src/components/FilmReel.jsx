import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export const FilmReel = ({ className = "" }) => {
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
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(0, 0, 4.4);

    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xcfe0ff, 1.0);
    rim.position.set(-4, -2, -3);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    const chrome = new THREE.MeshStandardMaterial({ color: 0xe9e9e9, metalness: 1, roughness: 0.22 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0.7, roughness: 0.5 });

    const reel = new THREE.Group();
    scene.add(reel);

    // disc
    const discGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.14, 56);
    const disc = new THREE.Mesh(discGeo, chrome);
    disc.rotation.x = Math.PI / 2;
    reel.add(disc);
    // rim
    const rimGeo = new THREE.TorusGeometry(1.15, 0.05, 14, 64);
    reel.add(new THREE.Mesh(rimGeo, chrome));
    // hub
    const hubGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.24, 24);
    const hub = new THREE.Mesh(hubGeo, chrome);
    hub.rotation.x = Math.PI / 2;
    reel.add(hub);
    // five lightening holes (dark insets)
    const holeGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.17, 28);
    for (let k = 0; k < 5; k++) {
      const a = (Math.PI * 2 * k) / 5;
      const h = new THREE.Mesh(holeGeo, dark);
      h.rotation.x = Math.PI / 2;
      h.position.set(Math.cos(a) * 0.64, Math.sin(a) * 0.64, 0.005);
      reel.add(h);
    }
    reel.rotation.x = 0.42;
    reel.rotation.y = -0.25;

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
        const scroll = (window.scrollY || 0) * 0.0024;
        reel.rotation.z = t * 0.25 + scroll;
        reel.rotation.y = -0.25 + Math.sin(t * 0.3) * 0.1;
        reel.position.y = Math.sin(t * 0.6) * 0.07;
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
      discGeo.dispose();
      rimGeo.dispose();
      hubGeo.dispose();
      holeGeo.dispose();
      chrome.dispose();
      dark.dispose();
      env.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} data-testid="film-reel-3d" aria-hidden="true" className={className} />;
};
