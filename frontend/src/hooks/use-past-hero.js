import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Whether the site's own chrome — the header bar, the footage counter — should
 * be showing.
 *
 * On the home page the projection hero owns the whole first screen and brings
 * its own nav and its own telemetry readout. Anything global that duplicates
 * those has to stand down until the hero is scrolled past, or the reader gets
 * two wordmarks and two footage counters stacked on one composition.
 */
export const useSiteChromeVisible = () => {
  const { pathname } = useLocation();
  const [pastHero, setPastHero] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return pathname !== "/" || pastHero;
};
