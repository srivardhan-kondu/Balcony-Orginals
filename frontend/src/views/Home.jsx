"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { api, UPCOMING_STATUSES } from "@/lib/api";
import { SIZES } from "@/lib/images";
import { MotionStill } from "@/components/Still";
import { ProjectionHero } from "@/components/ProjectionHero";
import { openMenu } from "@/components/Header";
import { useIsDesktop } from "@/hooks/use-media-query";
import { Reveal } from "@/components/Motion";
import { FilmRing } from "@/components/FilmRing";
import { ScrollFill } from "@/components/ScrollFill";
import { FilmRibbon } from "@/components/FilmRibbon";
import { Marquee } from "@/components/Marquee";
import { ProjectCard } from "@/components/ProjectCard";
import { SlateFocus } from "@/components/SlateFocus";
import { ReelModal } from "@/components/ReelModal";

/* ---------------------------------------------------------------------------
   The four WebGL decorations, loaded after the page rather than with it.

   Between them, `three` is 144KB gzipped — around a third of everything the
   home page ships, and more than the rest of the home page put together. All
   four are `aria-hidden` set dressing: a camera turning slowly in the corner of
   the films section, a reel ghosted behind the slate, a film strip rippling
   across a band, a projector beam over the gems still. Not one of them carries
   meaning, none is above the fold, and two are already gated to desktop.

   `ssr: false` because there is nothing for the server to render — each mounts
   a <canvas> and paints into it — and because it keeps three out of the
   prerender entirely. The page arrives, reads and scrolls; the decorations
   catch up.
   --------------------------------------------------------------------------- */
const CineCamera = dynamic(() => import("@/components/CineCamera").then((m) => m.CineCamera), { ssr: false });
const FilmReel = dynamic(() => import("@/components/FilmReel").then((m) => m.FilmReel), { ssr: false });
const ProjectorBeam = dynamic(() => import("@/components/ProjectorBeam").then((m) => m.ProjectorBeam), { ssr: false });
/* FilmRibbon defers its own canvas — see the note there — so it is imported
   normally and keeps its band in the prerendered HTML. */

const CHAPTERS = [
  {
    n: "01",
    title: "The red soil",
    body: "Rayalaseema — boulder hills, famine-hardened villages, forts and folklore — is where our eye was trained. The land teaches you to look longer, and to listen before you frame.",
  },
  {
    n: "02",
    title: "Devotional echoes",
    body: "Temples, jataras, lamps and processions. We document faith not as spectacle but as inheritance — carried in hands, kept in memory, renewed every year.",
  },
  {
    n: "03",
    title: "The wider canvas",
    body: "Rayalaseema is our roots, not our limit. From this soil the canvas widens — to Andhra Pradesh, to India — the eye stays the same.",
  },
  {
    n: "04",
    title: "The world",
    body: "Rooted stories travel. Our ambition is to carry these voices to audiences everywhere — in documentaries, and now, in cinema.",
  },
];

/* One primary treatment for the whole page. Previously the hero filled its
   primary with `bone` and the gems CTA filled with `gold` — which, while gold
   resolved to white, rendered as two near-identical fills and gave the hero
   button a hover state that changed nothing. Accent means action, everywhere. */
const BTN_PRIMARY =
  "inline-flex items-center gap-3 rounded-sm bg-gold px-7 py-4 text-xs font-medium uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-gold-hi";
const BTN_SECONDARY =
  "inline-flex items-center gap-3 rounded-sm border border-bone/30 px-7 py-4 text-xs uppercase tracking-[0.15em] text-bone transition-colors duration-300 hover:border-gold hover:text-gold";

const Overline = ({ children, testid }) => (
  <div className="mb-6 flex items-center gap-3" data-testid={testid}>
    <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
    <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-bone/60">{children}</span>
  </div>
);

const SectionLink = ({ to, children, testid }) => (
  <Link
    href={to}
    data-testid={testid}
    /* `py-2` only to carry the hit area past the 24px minimum — these sit on
       their own line, so they are not the inline-in-a-sentence case the target
       size rule exempts. */
    className="group inline-flex min-h-[24px] items-center gap-2.5 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-gold transition-colors hover:text-bone"
  >
    {children}
    <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
  </Link>
);

/* `initialProjects` is the archive as it stood when the site was built — the
   server renders the whole page with it, so the stories are in the delivered
   HTML rather than appearing a round trip later. The effect below still asks
   the live API and replaces it, exactly as before; the difference is only that
   there is no empty page while it does. */
export default function Home({ initialProjects = [] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [reelOpen, setReelOpen] = useState(false);
  // The two decorative WebGL scenes are desktop-only. Mounting them behind a
  // `hidden lg:block` still built the context and ran the loop on phones.
  const isDesktop = useIsDesktop();
  const gemsRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: gemsRef, offset: ["start end", "end start"] });
  const gemsY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  const stripRef = useRef(null);
  const trackRef = useRef(null);
  const [overflow, setOverflow] = useState(0);
  const { scrollYProgress: stripProg } = useScroll({ target: stripRef, offset: ["start start", "end end"] });
  const stripX = useTransform(stripProg, [0, 1], [0, -overflow]);

  /* A ResizeObserver on the track itself, rather than a window `resize`
     listener: the track's width changes when the cards' images lay out and when
     the font loads, neither of which resizes the window, and it was measuring
     against `window.innerWidth` — which counts the scrollbar the track does not
     get to use. */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const visible = track.parentElement?.clientWidth ?? 0;
      setOverflow(Math.max(0, track.scrollWidth - visible + 80));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    if (track.parentElement) ro.observe(track.parentElement);
    return () => ro.disconnect();
  }, [projects]);

  // The title, description and share card are declared by the route's
  // `metadata` export now, and are in the HTML before this ever runs.
  useEffect(() => {
    api.projects().then(setProjects).catch(() => {});
  }, []);

  const featured = projects.filter((p) => p.featured);
  const films = projects.filter((p) => p.type === "feature");
  const upcoming = projects.filter((p) => UPCOMING_STATUSES.includes(p.status));

  return (
    <div data-testid="home-page">
      {/* ————— HERO —————
          A projector strikes behind the brand mark and throws its cone down the
          page; the headline rises into the light. See ProjectionHero for the
          sequence, and use-projection-fit for how the copy is kept inside the
          beam. The stage pins itself dark — a projection room is a dark surface
          by design — and the site Header stands down while it is on screen. */}
      <ProjectionHero onOpenMenu={openMenu} onWatchReel={() => setReelOpen(true)} />

      <div className="relative z-[5] bg-ink">
      <Marquee />

      {/* ————— OUR ROOTS ————— */}
      <section data-testid="roots-section" className="mx-auto max-w-[1560px] px-[var(--bo-gutter)] py-[clamp(80px,12vh,150px)]">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.35fr]">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <Reveal>
              <Overline testid="roots-overline">Our roots</Overline>
              <h2 className="font-display font-extrabold uppercase tracking-[-0.015em] text-[clamp(28px,4.2vw,60px)] leading-[1.0] text-bone">
                Born from the land.
              </h2>
              <p className="mt-7 max-w-[44ch] text-[15px] leading-[1.7] text-mute">
                Balcony Originals begins with a place — but it is not limited to a place. Rayalaseema is the
                root system; the stories are free to travel.
              </p>
              <div className="mt-10">
                <div className="font-mono text-[10px] tracking-[0.24em] text-dim">
                  RAYALASEEMA → ANDHRA PRADESH → INDIA → WORLD
                </div>
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-3 h-px origin-left bg-gradient-to-r from-gold via-gold/50 to-transparent"
                />
              </div>
            </Reveal>
          </div>
          <div>
            {CHAPTERS.map((c, i) => (
              <Reveal key={c.n} delay={i * 0.08}>
                <div
                  data-testid={`roots-chapter-${c.n}`}
                  className="group border-t border-line py-9 transition-colors duration-500 first:border-t-0 first:pt-0 hover:bg-transparent md:py-11"
                >
                  <div className="flex items-baseline gap-6 md:gap-10">
                    <span className="font-mono text-sm tracking-[0.2em] text-gold/80">{c.n}</span>
                    <div>
                      <h3 className="font-serif text-[clamp(22px,2.4vw,34px)] text-bone transition-transform duration-500 group-hover:translate-x-2">
                        {c.title}
                      </h3>
                      <p className="mt-3 max-w-[52ch] text-[14.5px] leading-[1.7] text-mute">{c.body}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ————— FEATURED / THE ARCHIVE — the reel, big ————— */}
      <section data-testid="featured-section" className="relative overflow-hidden border-t border-line bg-ink2/40 pb-[clamp(50px,8vh,100px)] pt-[clamp(64px,9vh,110px)]">
        <div className="mx-auto max-w-[1560px] px-[var(--bo-gutter)]">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Overline testid="featured-overline">Featured work · drag the reel</Overline>
              <h2 className="font-display font-extrabold uppercase leading-[1.0] tracking-[-0.01em] text-[clamp(30px,4.4vw,64px)] text-bone">
                The archive, so far.
              </h2>
            </div>
            <SectionLink to="/works" testid="featured-view-all-link">
              Full archive
            </SectionLink>
          </Reveal>
        </div>
        <Reveal delay={0.15}>
          <FilmRing projects={featured} />
        </Reveal>
      </section>

      {/* ————— THE SCREENING ROOM — pinned horizontal reel ————— */}
      <section
        ref={stripRef}
        data-testid="documentaries-section"
        className="relative"
        style={{ height: `calc(100svh + ${Math.max(overflow, 500)}px)` }}
      >
        <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden border-t border-line">
          <div className="mx-auto w-full max-w-[1560px] px-[var(--bo-gutter)]">
            <div className="flex flex-wrap items-end justify-between gap-6 short:gap-3">
              <div>
                <Overline testid="docs-overline">The screening room · scroll to unspool</Overline>
                <h2 className="font-display font-extrabold uppercase leading-[1.02] tracking-[-0.01em] text-[clamp(26px,3.6vw,50px)] text-bone short:text-[clamp(20px,4vh,30px)]">
                  One reel. Every story.
                </h2>
              </div>
              <SectionLink to="/works" testid="docs-view-all-link">
                Full archive
              </SectionLink>
            </div>
          </div>
          <motion.div
            ref={trackRef}
            style={{ x: stripX }}
            className="mt-12 flex w-max gap-6 pl-[var(--bo-gutter)] will-change-transform short:mt-5 short:gap-4"
          >
            {projects.map((p, i) => (
              /* The cards are sized by width, but their height follows from it
                 at 16/10 — so on a short viewport the width has to be capped by
                 the height available, or a 44vw card in landscape is taller
                 than the panel that holds it and gets cropped. */
              <div
                key={p.slug}
                className="w-[80vw] max-w-[calc(52svh*1.6)] flex-none md:w-[44vw] lg:w-[34vw]"
              >
                <ProjectCard project={p} large index={i} sizes={SIZES.strip} />
              </div>
            ))}
            <Link
              href="/works"
              data-testid="strip-archive-link"
              className="group flex w-[60vw] max-w-[calc(40svh*1.6)] flex-none items-center justify-center rounded-sm border border-dashed border-line md:w-[26vw]"
            >
              <span className="flex items-center gap-3 px-6 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-bone/70 transition-colors group-hover:text-bone">
                Full archive <ArrowRight size={14} className="flex-none" />
              </span>
            </Link>
          </motion.div>
          <div className="mx-[var(--bo-gutter)] mt-12 h-px bg-line short:mt-5">
            <motion.div style={{ scaleX: stripProg }} className="h-px origin-left bg-bone/70" />
          </div>
        </div>
      </section>

      {/* ————— FEATURE FILMS ————— */}
      <section data-testid="films-section" className="relative overflow-hidden border-t border-line py-[clamp(80px,12vh,150px)]">
        {isDesktop && (
          <CineCamera className="pointer-events-none absolute right-[3%] top-[2%] z-0 h-[420px] w-[420px]" />
        )}
        <div className="relative z-[2] mx-auto max-w-[1560px] px-[var(--bo-gutter)]">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <Overline testid="films-overline">Feature films</Overline>
              <h2 className="font-serif text-[clamp(28px,4vw,58px)] leading-[1.04] text-bone">
                Stories becoming cinema.
              </h2>
              <p className="mt-7 max-w-[48ch] text-[15px] leading-[1.7] text-mute">
                The same rooted philosophy — authentic people, culture, place, emotion — now shaped for the
                big screen. Our first feature is in development; details stay in the soil until they're ready
                for light.
              </p>
              <div className="mt-9">
                <SectionLink to="/works?type=feature" testid="films-view-all-link">
                  Feature slate
                </SectionLink>
              </div>
            </Reveal>
            <div>
              {films.map((p) => (
                <Reveal key={p.slug} delay={0.15}>
                  <ProjectCard project={p} large sizes={SIZES.half} />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FilmRibbon />

      {/* ————— UPCOMING ————— */}
      <section data-testid="upcoming-section" className="relative overflow-hidden border-t border-line bg-ink2/40 py-[clamp(80px,12vh,150px)]">
        {isDesktop && (
          <FilmReel className="pointer-events-none absolute -right-[7%] top-1/2 z-0 h-[620px] w-[620px] -translate-y-1/2 opacity-20" />
        )}
        <div className="relative z-[2] mx-auto max-w-[1560px] px-[var(--bo-gutter)]">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Overline testid="upcoming-overline">Upcoming / In development</Overline>
              <h2 className="font-display font-extrabold uppercase tracking-[-0.01em] text-[clamp(26px,3.6vw,50px)] leading-[1.02] text-bone">
                Stories yet to be told.
              </h2>
            </div>
            <SectionLink to="/upcoming" testid="upcoming-view-all-link">
              Full slate
            </SectionLink>
          </Reveal>
          <SlateFocus projects={upcoming} />
        </div>
      </section>

      {/* ————— STORIES ARE GEMS ————— */}
      <section ref={gemsRef} data-testid="gems-section" className="relative overflow-hidden border-t border-line">
        <MotionStill
          src="/assets/projects/gems.jpg"
          sizes={SIZES.full}
          aria-hidden="true"
          loading="lazy"
          style={{ y: gemsY }}
          className="absolute inset-0 h-[120%] w-full object-cover opacity-40"
        />
        <ProjectorBeam className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/60 to-ink" />
        <div className="relative mx-auto max-w-[1560px] px-[var(--bo-gutter)] py-[clamp(110px,16vh,200px)]">
          <Reveal className="max-w-[780px]">
            <Overline testid="gems-overline">Stories are gems</Overline>
            <h2 className="font-display font-extrabold uppercase tracking-[-0.02em] text-[clamp(28px,4.8vw,70px)] leading-[1.0] text-bone">
              Have a story that deserves to be told?
            </h2>
            <p className="mt-8 max-w-[52ch] text-[15.5px] leading-[1.7] text-bone/75">
              Every story is a gem. Some have the idea, the lived experience, the cultural weight — but not
              the resources or the platform. If you have the story but need the backbone to bring it to life,
              tell us about it.
            </p>
            <div className="mt-10">
              <Link href="/submit-story" data-testid="gems-cta-btn" className={BTN_PRIMARY}>
                Submit Your Story
                <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ————— WHY WE TELL STORIES ————— */}
      <section data-testid="why-section" className="border-t border-line">
        <div className="mx-auto grid max-w-[1560px] gap-14 px-[var(--bo-gutter)] py-[clamp(80px,12vh,150px)] lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <Overline testid="why-overline">Why we tell stories</Overline>
            <div className="font-telugu text-[clamp(26px,3vw,40px)] leading-[1.5] text-gold/90">
              ప్రతి కథ ఒక రత్నం
            </div>
            <div className="mt-3 font-mono text-[10px] tracking-[0.24em] text-dim">
              EVERY STORY IS A GEM
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="font-serif text-[clamp(20px,2.2vw,30px)] leading-[1.5] text-bone">
              <ScrollFill text="We believe a story doesn't need permission to matter — it needs a patient camera, an honest edit, and someone willing to carry it. Balcony Originals exists to be that someone: to preserve stories, produce stories, and give strong stories a chance to travel." />
            </p>
            <div className="mt-8 font-mono text-[10.5px] tracking-[0.22em] text-dim">
              — BALCONY ORIGINALS · PRODUCTION PHILOSOPHY
            </div>
          </Reveal>
        </div>
      </section>

      {/* ————— FINAL CTA ————— */}
      <section data-testid="final-cta-section" className="relative overflow-hidden border-t border-line bg-ink2/40">
        <div className="mx-auto max-w-[1560px] px-[var(--bo-gutter)] py-[clamp(110px,16vh,190px)] text-center">
          <h2 className="mx-auto max-w-[24ch] font-display font-extrabold uppercase leading-[1.1] tracking-[-0.02em] text-[clamp(26px,4.4vw,62px)] text-bone">
            <ScrollFill text="Every place has a story. Every person carries one. We're here to tell it." />
          </h2>
          <Reveal delay={0.4}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3.5">
              <Link href="/works" data-testid="final-explore-btn" className={BTN_PRIMARY}>
                Explore Stories
              </Link>
              <Link href="/submit-story" data-testid="final-submit-btn" className={BTN_SECONDARY}>
                Submit Your Story
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
      </div>

      <ReelModal open={reelOpen} onClose={() => setReelOpen(false)} label="BALCONY ORIGINALS · BRAND FILM" />
    </div>
  );
}
