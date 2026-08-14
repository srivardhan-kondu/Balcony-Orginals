import { useEffect, useRef } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/sonner";
import { Grain } from "@/components/Grain";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Intro } from "@/components/Intro";
import { FootageCounter } from "@/components/FootageCounter";
import { ClapperTransition } from "@/components/ClapperTransition";
import { CursorPreview } from "@/components/CursorPreview";
import Home from "@/pages/Home";
import Works from "@/pages/Works";
import ProjectDetail from "@/pages/ProjectDetail";
import Upcoming from "@/pages/Upcoming";
import SubmitStory from "@/pages/SubmitStory";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";

const ScrollManager = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
};

function App() {
  const mainRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    let raf;
    let skew = 0;
    const loop = (t) => {
      lenis.raf(t);
      // film-slip skew: the page stretches slightly with scroll velocity
      const v = lenis.velocity || 0;
      const target = Math.max(-3, Math.min(3, v * 0.18));
      skew += (target - skew) * 0.12;
      if (mainRef.current) {
        mainRef.current.style.transform = Math.abs(skew) > 0.01 ? `skewY(${skew.toFixed(3)}deg)` : "";
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <div className="min-h-screen bg-ink text-bone">
      <BrowserRouter>
        <Grain />
        <Intro />
        <Header />
        <ScrollManager />
        <main ref={mainRef} className="will-change-transform">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/works" element={<Works />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/upcoming" element={<Upcoming />} />
            <Route path="/submit-story" element={<SubmitStory />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <FootageCounter />
        <ClapperTransition />
        <CursorPreview />
        <Toaster theme="dark" position="bottom-right" />
      </BrowserRouter>
    </div>
  );
}

export default App;
