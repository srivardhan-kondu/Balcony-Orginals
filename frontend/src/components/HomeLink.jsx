"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/* Back to the top of the page. Lenis owns the scroll position when it is
   running, so it is asked first; the window only when it is not (reduced
   motion, where Lenis is never started). */
export const scrollToTop = () => {
  if (window.__lenis) {
    window.__lenis.scrollTo(0, { duration: 1.2 });
    return;
  }
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
};

/* A link to the home page that also works from the home page. Clicking a link
   to the route you are already on changes nothing in the router, so the
   ScrollManager reset never runs and the logo appeared to do nothing. Here
   that case scrolls back to the top instead. Modified clicks (new tab, new
   window) are left to the browser. */
export const HomeLink = ({ children, onClick, ...props }) => {
  const pathname = usePathname();
  return (
    <Link
      href="/"
      {...props}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || pathname !== "/") return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        scrollToTop();
      }}
    >
      {children}
    </Link>
  );
};
