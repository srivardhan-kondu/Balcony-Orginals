"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { EASE } from "@/components/Motion";
import { useOverlay } from "@/hooks/use-overlay";
import { useSiteChromeVisible } from "@/hooks/use-past-hero";

const LINKS = [
  { to: "/works", label: "Stories", testid: "nav-link-works" },
  { to: "/works?type=feature", label: "Films", testid: "nav-link-films" },
  { to: "/upcoming", label: "Upcoming", testid: "nav-link-upcoming" },
  { to: "/about", label: "About", testid: "nav-link-about" },
  { to: "/contact", label: "Contact", testid: "nav-link-contact" },
];

/* 44px is the smallest reliably tappable target. The bar's buttons are small by
   design, so the box is grown to meet it without growing the ink. */
const TAP = "inline-flex min-h-[44px] min-w-[44px] items-center justify-center";

/* The projection hero carries its own MENU button, and the overlay it opens
   lives here. One event rather than lifting the open/closed state into a
   context for a single caller. */
const OPEN_MENU = "bo:open-menu";
export const openMenu = () => window.dispatchEvent(new Event(OPEN_MENU));

/* The current location as one string, so it can be compared against a link's
   own href — including the query, because STORIES and FILMS are the same route
   and differ only by `?type=feature`.

   `useSearchParams` is what makes this exact, and it is also what forces the
   Suspense boundary below: during static generation there is no query to read,
   so Next prerenders the boundary's fallback instead. That is why the fallback
   is the same nav rendered with the pathname alone rather than `null` — the
   primary links have to be in the delivered HTML for a crawler, and for anyone
   whose JavaScript never arrives. The only thing deferred to hydration is which
   of them is marked as current. */
const useCurrentHref = () => {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  return query ? `${pathname}?${query}` : pathname;
};

const DesktopNav = ({ current }) => (
  <nav className="hidden items-center gap-[clamp(18px,2.4vw,36px)] lg:flex" aria-label="Primary">
    {LINKS.map((l) => (
      <Link
        key={l.testid}
        href={l.to}
        data-testid={l.testid}
        aria-current={current === l.to ? "page" : undefined}
        className={`text-xs uppercase tracking-[0.15em] transition-colors duration-200 hover:text-gold ${
          current === l.to ? "text-gold" : "text-bone/80"
        }`}
      >
        {l.label}
      </Link>
    ))}
    <Link
      href="/submit-story"
      data-testid="nav-link-submit-story"
      className="inline-flex items-center gap-2.5 rounded-sm border border-gold/50 px-[18px] py-2.5 text-[11.5px] uppercase tracking-[0.15em] text-gold transition-all duration-300 hover:border-gold hover:bg-gold hover:text-ink"
    >
      <span className="h-[5px] w-[5px] rotate-45 bg-current" />
      Submit Your Story
    </Link>
  </nav>
);

const ActiveDesktopNav = () => <DesktopNav current={useCurrentHref()} />;

/* The overlay only exists once the reader has opened it, so it is never part of
   a prerender and can read the query directly — no boundary needed here. */
const MobileMenu = ({ menuRef, onClose }) => {
  const current = useCurrentHref();

  return (
    <motion.div
      ref={menuRef}
      data-testid="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      tabIndex={-1}
      /* The overlay is a scroll container in its own right. It used to be
         a fixed box with `my-auto` content and no overflow rule, which is
         fine at 844px of height and unusable at 390: six 52px links plus
         chrome came to ~720px, centred, so the list was clipped at both
         ends with no way to reach the far half of the nav. Any phone in
         landscape, or any short desktop window, hit it. */
      className="fixed inset-0 z-[120] flex flex-col overflow-y-auto overscroll-contain bg-scrim/[0.97] px-[var(--bo-gutter)] py-6 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-none items-center justify-between">
        <img src="/assets/bo-mark.png" alt="" width="211" height="284" className="h-7 w-auto" />
        <button
          data-testid="mobile-menu-close-btn"
          onClick={onClose}
          className={`${TAP} rounded-sm border border-bone/20 px-3.5 text-[11px] uppercase tracking-[0.16em] text-bone`}
          aria-label="Close menu"
        >
          Close
        </button>
      </div>
      {/* `my-auto` centres the list when it fits and collapses to the top
          when it does not, so overflow scrolls downward instead of
          disappearing off both edges. */}
      <nav className="my-auto flex flex-none flex-col py-6" aria-label="Mobile">
        {LINKS.map((l, i) => (
          <motion.div
            key={l.testid}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08 + i * 0.07, ease: EASE }}
          >
            <Link
              href={l.to}
              onClick={onClose}
              data-testid={`mobile-${l.testid}`}
              aria-current={current === l.to ? "page" : undefined}
              /* The type scales with the shorter axis too. At 8vw alone a
                 phone in landscape asked for 52px lines it had no room
                 for; `min()` lets height veto width. */
              className={`block border-b border-bone/10 py-3 font-serif leading-[1.15] text-[clamp(26px,min(8vw,7.5vh),52px)] ${
                current === l.to ? "text-gold" : "text-bone"
              }`}
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
            href="/submit-story"
            onClick={onClose}
            data-testid="mobile-nav-link-submit-story"
            className="block py-3 font-serif leading-[1.15] text-[clamp(26px,min(8vw,7.5vh),52px)] text-gold"
          >
            Submit Your Story
          </Link>
        </motion.div>
      </nav>
      <div className="flex-none font-mono text-[10px] tracking-[0.18em] text-dim">
        RAYALASEEMA · ANDHRA PRADESH · INDIA
      </div>
    </motion.div>
  );
};

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef(null);
  const chromeVisible = useSiteChromeVisible();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_MENU, onOpen);
    return () => window.removeEventListener(OPEN_MENU, onOpen);
  }, []);

  /* Every link in the overlay closes it on click, which covers the ordinary
     case exactly. This is the backstop for the ones that do not go through a
     click at all — the browser's own back and forward buttons. */
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /* On home the projection hero has its own nav row around the lamp mark, so
     the bar stands down rather than sitting a second wordmark on top of the
     composition. It slides back in once the hero is scrolled past. */
  const standDown = !chromeVisible;

  useOverlay(open, () => setOpen(false), menuRef);

  return (
    <>
      <header
        data-testid="header-navigation"
        // Unscrolled, the bar is transparent and reads against whatever is under
        // it — the page background off home, the footage hero on it.
        aria-hidden={standDown || undefined}
        className={`fixed inset-x-0 top-0 z-[80] transition-all duration-500 ${
          standDown ? "pointer-events-none -translate-y-full opacity-0" : "translate-y-0 opacity-100"
        } ${
          scrolled
            ? "border-b border-line bg-ink/85 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[var(--bo-header-h)] max-w-[1560px] items-center justify-between gap-5 px-[var(--bo-gutter)]">
          <Link href="/" data-testid="nav-link-home" className="flex flex-none items-center gap-3" aria-label="Balcony Originals — home">
            {/* Intrinsic dimensions: without them the bar reflows the moment the
                marks decode, on every cold load. */}
            <img src="/assets/bo-mark.png" alt="Balcony Originals" width="211" height="284" className="block h-[29px] w-auto" />
            <span className="h-[22px] w-px bg-bone/20" />
            <img src="/assets/bo-wordmark.png" alt="" width="491" height="49" className="block h-[10px] w-auto opacity-90" />
          </Link>

          <Suspense fallback={<DesktopNav current={pathname} />}>
            <ActiveDesktopNav />
          </Suspense>

          <div className="flex items-center gap-2.5 lg:hidden">
            <button
              data-testid="mobile-menu-btn"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-haspopup="dialog"
              className={`${TAP} rounded-sm border border-bone/20 px-3.5 text-[11px] uppercase tracking-[0.16em] text-bone`}
              aria-label="Open menu"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && <MobileMenu menuRef={menuRef} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
};
