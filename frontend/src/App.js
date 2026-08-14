import { useEffect } from "react";
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
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    window.__lenis = lenis;
    let raf;
    const loop = (t) => {
      lenis.raf(t);
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
        <main>
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
