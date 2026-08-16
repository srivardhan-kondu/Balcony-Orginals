import { Link } from "react-router-dom";
import { LampMark } from "@/components/projection/LampMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useMediaQuery } from "@/hooks/use-media-query";
import { T, at, anim } from "@/lib/projection-timeline";

/* The hero's own top row: links either side of the lamp. The site's global
   Header stands down while this is on screen (see Header.jsx) and slides back
   in once the hero is scrolled past, so navigation is never actually absent —
   it just isn't duplicated over the composition. */

const LEFT = [
  { to: "/works", label: "STORIES" },
  { to: "/works?type=feature", label: "FILMS" },
  { to: "/upcoming", label: "UPCOMING" },
];
const RIGHT = [
  { to: "/about", label: "ABOUT" },
  { to: "/contact", label: "CONTACT" },
];

const link = "font-mono text-xs tracking-[0.24em] transition-colors duration-200";
/* Height as well as width. At 844x390 — a phone on its side — the viewport is
   "desktop" by width alone, but there is no room beside the lamp for five links
   and a button: they ran straight over the mark. Short viewports take the
   compact row instead. */
const DESKTOP = "(min-width: 760px) and (min-height: 600px)";

export const ProjectionNav = ({ markRef, onOpenMenu }) => {
  const desktop = useMediaQuery(DESKTOP);
  const reveal = anim(`bp-fade .9s ease ${at(T.nav)} both`);

  return (
    <nav
      className="relative z-[3] grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-[clamp(12px,2vw,32px)] px-[clamp(18px,4vw,56px)] pt-[clamp(20px,3vh,30px)]"
      aria-label="Primary"
    >
      {desktop ? (
        <div
          data-anim="navl"
          className="flex items-center gap-[clamp(14px,2.2vw,40px)] opacity-0"
          style={reveal}
        >
          {LEFT.map((l) => (
            <Link key={l.label} to={l.to} data-testid={`hero-nav-${l.label.toLowerCase()}`} className={`${link} text-[#e6e6e6] hover:text-white`}>
              {l.label}
            </Link>
          ))}
        </div>
      ) : (
        <button
          type="button"
          data-anim="navm"
          onClick={onOpenMenu}
          data-testid="hero-menu-btn"
          aria-label="Open menu"
          className="inline-flex min-h-[44px] items-center justify-self-start font-mono text-[11px] tracking-[0.24em] text-[#8e8e8e] opacity-0 transition-colors hover:text-white"
          style={reveal}
        >
          MENU
        </button>
      )}

      <Link to="/" aria-label="Balcony Originals — home" className="justify-self-center">
        <LampMark ref={markRef} />
      </Link>

      {desktop ? (
        <div
          data-anim="navr"
          className="flex items-center justify-end gap-[clamp(14px,2vw,32px)] opacity-0"
          style={reveal}
        >
          {RIGHT.map((l) => (
            <Link key={l.label} to={l.to} data-testid={`hero-nav-${l.label.toLowerCase()}`} className={`${link} text-[#e6e6e6] hover:text-white`}>
              {l.label}
            </Link>
          ))}
          <Link
            to="/submit-story"
            data-testid="hero-nav-submit"
            className={`${link} flex items-center gap-2.5 border border-[#2f2f2f] px-5 py-[13px] text-[#e6e6e6] hover:border-[#f2f2f2] hover:text-white`}
          >
            <span aria-hidden="true" className="h-[7px] w-[7px] rotate-45 bg-[#ec3013]" />
            <span className="whitespace-nowrap">SUBMIT YOUR STORY</span>
          </Link>
          <ThemeToggle className="!min-h-[44px] !min-w-[44px] border-[#2f2f2f] text-[#b4b4b4] hover:border-[#f2f2f2] hover:text-white" />
        </div>
      ) : (
        <div
          data-anim="navmr"
          className="flex items-center justify-end gap-2 justify-self-end opacity-0"
          style={reveal}
        >
          <span className="hidden whitespace-nowrap font-mono text-[11px] tracking-[0.24em] text-[#8e8e8e] xs:inline">
            24 FPS
          </span>
          <ThemeToggle className="border-[#2f2f2f] text-[#b4b4b4] hover:border-[#f2f2f2] hover:text-white" />
        </div>
      )}
    </nav>
  );
};
