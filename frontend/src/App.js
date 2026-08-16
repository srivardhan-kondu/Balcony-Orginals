import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import Lenis from "lenis";
import { Toaster } from "@/components/ui/sonner";
import { Grain } from "@/components/Grain";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Intro } from "@/components/Intro";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FootageCounter } from "@/components/FootageCounter";
import { ClapperTransition } from "@/components/ClapperTransition";
import Home from "@/pages/Home";
import Works from "@/pages/Works";
import ProjectDetail from "@/pages/ProjectDetail";
import Upcoming from "@/pages/Upcoming";
import SubmitStory from "@/pages/SubmitStory";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import NotFound from "@/pages/NotFound";
import { useThemeMode } from "@/lib/theme";

const THEME_COLOR = { dark: "#0C0B0A", light: "#FAF9F6" };

const ScrollManager = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname, search]);
  return null;
};

function App() {
  const mode = useThemeMode();

  // Keeps the browser chrome (mobile address bar, PWA surface) in step with the
  // theme; the boot script sets it for the first paint.
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLOR[mode]);
  }, [mode]);

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
    /* The stylesheet's reduced-motion block can only reach CSS animation and
       transition. Every reveal, masked headline, parallax and card tilt on this
       site is a framer-motion transform, which that block cannot touch —
       `reducedMotion="user"` is what actually holds them still, by making the
       library drop transform and layout animations while keeping opacity, so
       nothing is left invisible mid-reveal. */
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-ink text-bone">
      <BrowserRouter>
        <Grain />
        <Intro />
        <Header />
        <ScrollManager />
        <main>
          <ErrorBoundary>
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
          </ErrorBoundary>
        </main>
        <Footer />
        <FootageCounter />
        <ClapperTransition />
        <Toaster position="bottom-right" />
      </BrowserRouter>
    </div>
    </MotionConfig>
  );
}

export default App;
