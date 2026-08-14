import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/components/Motion";

const LINKS = [
  { to: "/works", label: "Stories", testid: "nav-link-works" },
  { to: "/works?type=feature", label: "Films", testid: "nav-link-films" },
  { to: "/upcoming", label: "Upcoming", testid: "nav-link-upcoming" },
  { to: "/about", label: "About", testid: "nav-link-about" },
  { to: "/contact", label: "Contact", testid: "nav-link-contact" },
];

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        data-testid="header-navigation"
        className={`fixed inset-x-0 top-0 z-[80] transition-all duration-500 ${
          scrolled ? "border-b border-line bg-ink/85 backdrop-blur-xl" : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[clamp(64px,8vh,84px)] max-w-[1560px] items-center justify-between gap-5 px-[clamp(18px,4vw,58px)]">
          <Link to="/" data-testid="nav-link-home" className="flex flex-none items-center gap-3" aria-label="Balcony Originals — home">
            <img src="/assets/bo-mark.png" alt="Balcony Originals" className="block h-[29px] w-auto" />
            <span className="h-[22px] w-px bg-bone/20" />
            <img src="/assets/bo-wordmark.png" alt="" className="block h-[10px] w-auto opacity-90" />
          </Link>

          <nav className="hidden items-center gap-[clamp(18px,2.4vw,36px)] lg:flex" aria-label="Primary">
            {LINKS.map((l) => (
              <Link
                key={l.testid}
                to={l.to}
                data-testid={l.testid}
                className="text-xs uppercase tracking-[0.15em] text-bone/80 transition-colors duration-200 hover:text-gold"
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/submit-story"
              data-testid="nav-link-submit-story"
              className="inline-flex items-center gap-2.5 rounded-sm border border-gold/50 px-[18px] py-2.5 text-[11.5px] uppercase tracking-[0.15em] text-gold transition-all duration-300 hover:border-gold hover:bg-gold hover:text-ink"
            >
              <span className="h-[5px] w-[5px] rotate-45 bg-current" />
              Submit Your Story
            </Link>
          </nav>

          <button
            data-testid="mobile-menu-btn"
            onClick={() => setOpen(true)}
            className="rounded-sm border border-bone/20 px-3.5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-bone lg:hidden"
            aria-label="Open menu"
          >
            Menu
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            data-testid="mobile-menu"
            className="fixed inset-0 z-[120] flex flex-col bg-[#090807]/97 px-[clamp(18px,4vw,58px)] py-6 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <img src="/assets/bo-mark.png" alt="" className="h-7 w-auto" />
              <button
                data-testid="mobile-menu-close-btn"
                onClick={() => setOpen(false)}
                className="rounded-sm border border-bone/20 px-3.5 py-2.5 text-[11px] uppercase tracking-[0.16em] text-bone"
                aria-label="Close menu"
              >
                Close
              </button>
            </div>
            <nav className="my-auto flex flex-col" aria-label="Mobile">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.testid}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.08 + i * 0.07, ease: EASE }}
                >
                  <Link
                    to={l.to}
                    data-testid={`mobile-${l.testid}`}
                    className="block border-b border-bone/10 py-3 font-serif text-[clamp(30px,8vw,52px)] text-bone"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08 + LINKS.length * 0.07, ease: EASE }}
              >
                <Link
                  to="/submit-story"
                  data-testid="mobile-nav-link-submit-story"
                  className="block py-3 font-serif text-[clamp(30px,8vw,52px)] text-gold"
                >
                  Submit Your Story
                </Link>
              </motion.div>
            </nav>
            <div className="font-mono text-[10.5px] tracking-[0.18em] text-bone/35">
              RAYALASEEMA · ANDHRA PRADESH · INDIA
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
