import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export const CineCamera = ({ className = "" }) => {
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

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50);
    camera.position.set(0, 0.2, 5.2);

    const key = new THREE.DirectionalLight(0xffffff, 1.8);
    key.position.set(3, 4, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xcfe0ff, 1.1);
    rim.position.set(-4, -1, -3);
    scene.add(rim);
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));

    const chrome = new THREE.MeshStandardMaterial({ color: 0xe9e9e9, metalness: 1, roughness: 0.24 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x232323, metalness: 0.85, roughness: 0.45 });

    const cam = new THREE.Group();
    scene.add(cam);

    // body
    cam.add(new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.05, 0.95), chrome));
    // top film magazine
    const mag = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.3, 44), dark);
    mag.position.set(0, 0.68, 0);
    cam.add(mag);
    // lens barrel
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.27, 0.7, 32), dark);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(0, -0.06, 0.78);
    cam.add(lens);
    const lensRing = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.04, 14, 40), chrome);
    lensRing.position.set(0, -0.06, 1.14);
    cam.add(lensRing);
    // viewfinder horn
    const horn = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.1, 0.55, 20), dark);
    horn.rotation.x = -1.15;
    horn.position.set(-0.42, 0.38, -0.62);
    cam.add(horn);
    // side crank
    const crank = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.34, 16), chrome);
    crank.rotation.z = Math.PI / 2;
    crank.position.set(1.0, 0.1, 0.2);
    cam.add(crank);

    // twin film reels with spokes, facing viewer
    const reelGeo = new THREE.CylinderGeometry(0.33, 0.33, 0.09, 36);
    const spokeGeo = new THREE.BoxGeometry(0.56, 0.05, 0.1);
    const hubGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.14, 16);
    const reels = [];
    [-0.42, 0.42].forEach((x) => {
      const rg = new THREE.Group();
      const disc = new THREE.Mesh(reelGeo, chrome);
      disc.rotation.x = Math.PI / 2;
      rg.add(disc);
      const hub = new THREE.Mesh(hubGeo, dark);
      hub.rotation.x = Math.PI / 2;
      rg.add(hub);
      for (let k = 0; k < 3; k++) {
        const spoke = new THREE.Mesh(spokeGeo, dark);
        spoke.rotation.z = (Math.PI / 3) * k;
        rg.add(spoke);
      }
      rg.position.set(x, 0.72, 0.34);
      cam.add(rg);
      reels.push(rg);
    });

    cam.rotation.y = 0.55;
    cam.rotation.x = 0.06;

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
        const scroll = (window.scrollY || 0) * 0.00035;
        cam.rotation.y = 0.55 + Math.sin(t * 0.22) * 0.14 + scroll;
        cam.position.y = Math.sin(t * 0.7) * 0.09;
        reels.forEach((r, i) => {
          r.rotation.z = t * (i % 2 ? -1.6 : 1.6) + scroll * 4;
        });
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
      env.dispose();
      pmrem.dispose();
      chrome.dispose();
      dark.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} data-testid="cine-camera-3d" aria-hidden="true" className={className} />;
};
