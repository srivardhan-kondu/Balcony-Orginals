import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Play } from "lucide-react";
import { api, UPCOMING_STATUSES } from "@/lib/api";
import { WebGLHero } from "@/components/WebGLHero";
import { Reveal, MaskLines, EASE } from "@/components/Motion";
import { FilmRing } from "@/components/FilmRing";
import { Marquee } from "@/components/Marquee";
import { ProjectCard, StatusChip } from "@/components/ProjectCard";
import { ReelModal } from "@/components/ReelModal";

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

const Overline = ({ children, testid }) => (
  <div className="mb-6 flex items-center gap-3" data-testid={testid}>
    <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
    <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-bone/60">{children}</span>
  </div>
);

const SectionLink = ({ to, children, testid }) => (
  <Link
    to={to}
    data-testid={testid}
    className="group inline-flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-gold transition-colors hover:text-bone"
  >
    {children}
    <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
  </Link>
);

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [reelOpen, setReelOpen] = useState(false);
  const gemsRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: gemsRef, offset: ["start end", "end start"] });
  const gemsY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  useEffect(() => {
    document.title = "Balcony Originals — Stories rooted in culture. Told for the world.";
    api.projects().then(setProjects).catch(() => {});
  }, []);

  const featured = projects.filter((p) => p.featured);
  const told = projects.filter((p) => p.type === "documentary" && p.status === "completed");
  const films = projects.filter((p) => p.type === "feature");
  const upcoming = projects.filter((p) => UPCOMING_STATUSES.includes(p.status));

  return (
    <div data-testid="home-page">
      {/* ————— HERO ————— */}
      <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
        <WebGLHero className="absolute inset-0" />

        {/* Brand animation — the 3D film-reel "B" assembling, held on its final frame */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.8, delay: 0.15, ease: EASE }}
          className="pointer-events-none absolute inset-0 flex items-start justify-center pt-[13vh] md:items-center md:justify-end md:pr-[2vw] md:pt-0"
        >
          <video
            src="/assets/balcony-intro.mp4"
            poster="/assets/intro-poster.jpg"
            autoPlay
            muted
            playsInline
            preload="auto"
            data-testid="hero-brand-video"
            className="bo-hero-video w-[min(86vw,440px)] opacity-95 md:w-[min(44vw,680px)]"
            style={{ filter: "invert(1) brightness(.98) contrast(1.9)", mixBlendMode: "screen" }}
          />
        </motion.div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />

        <span aria-hidden="true" className="absolute left-[26px] top-[96px] h-9 w-9 border-l border-t border-bone/25" />
        <span aria-hidden="true" className="absolute right-[26px] top-[96px] h-9 w-9 border-r border-t border-bone/25" />
        <div className="absolute right-[clamp(26px,4vw,58px)] top-[150px] hidden font-mono text-[9.5px] leading-[2] tracking-[0.22em] text-bone/35 md:block">
          24 FPS · 35 MM
          <br />
          RAYALASEEMA · AP
          <br />
          LAT 14.75 N
        </div>

        <div className="relative mx-auto w-full max-w-[1560px] px-[clamp(18px,4vw,58px)] pb-[clamp(26px,4vh,46px)] pt-[clamp(110px,14vh,180px)]">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="mb-[clamp(18px,3vh,30px)] flex items-center gap-3"
          >
            <span className="h-1.5 w-1.5 rotate-45 bg-bone" />
            <span className="font-mono text-[10.5px] tracking-[0.24em] text-bone/60">
              PRODUCTION HOUSE · EST. RAYALASEEMA
            </span>
          </motion.div>

          <h1
            data-testid="hero-headline"
            className="font-display text-[clamp(34px,6.2vw,98px)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-bone"
          >
            <MaskLines
              lines={["Stories rooted", "in culture.", "Told for the world."]}
              delay={0.3}
              lastClassName="text-sand"
            />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.75 }}
            className="mt-[clamp(20px,3vh,32px)] max-w-[52ch] text-[15px] leading-[1.65] text-bone/70 md:text-[17px]"
          >
            Documentaries, films and stories rooted in the people, places and cultures that shape us.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9 }}
            className="mt-[clamp(28px,4vh,42px)] flex flex-wrap items-center gap-3.5"
          >
            <Link
              to="/works"
              data-testid="hero-explore-btn"
              className="rounded-sm bg-bone px-7 py-4 text-xs font-medium uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-gold"
            >
              Explore Stories
            </Link>
            <Link
              to="/submit-story"
              data-testid="hero-submit-story-btn"
              className="rounded-sm border border-bone/30 px-7 py-4 text-xs uppercase tracking-[0.15em] text-bone transition-colors duration-300 hover:border-gold hover:text-ink hover:bg-gold"
            >
              Submit Your Story
            </Link>
            <button
              onClick={() => setReelOpen(true)}
              data-testid="hero-watch-reel-btn"
              className="group inline-flex items-center gap-3 px-1.5 py-4 text-[11.5px] uppercase tracking-[0.15em] text-bone/60 transition-colors hover:text-bone"
            >
              <span className="flex h-[34px] w-[34px] items-center justify-center rounded-full border border-bone/35 transition-colors duration-300 group-hover:border-bone">
                <Play size={10} className="ml-0.5 fill-current" />
              </span>
              Brand film
            </button>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-1/2 hidden h-14 w-px -translate-x-1/2 overflow-hidden md:block">
          <div className="bo-scroll-line h-full w-px bg-bone/70" />
        </div>
      </section>

      <Marquee />

      {/* ————— OUR ROOTS ————— */}
      <section data-testid="roots-section" className="mx-auto max-w-[1560px] px-[clamp(18px,4vw,58px)] py-[clamp(80px,12vh,150px)]">
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
                <div className="font-mono text-[10px] tracking-[0.24em] text-bone/40">
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

      {/* ————— FEATURED / ARCHIVE ————— */}
      <section data-testid="featured-section" className="border-t border-line bg-ink2/40 py-[clamp(80px,12vh,150px)]">
        <div className="mx-auto max-w-[1560px] px-[clamp(18px,4vw,58px)]">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Overline testid="featured-overline">Featured work</Overline>
              <h2 className="font-display font-extrabold uppercase tracking-[-0.01em] text-[clamp(26px,3.6vw,50px)] leading-[1.02] text-bone">
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

      {/* ————— DOCUMENTARIES ————— */}
      <section data-testid="documentaries-section" className="mx-auto max-w-[1560px] px-[clamp(18px,4vw,58px)] py-[clamp(80px,12vh,150px)]">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Overline testid="docs-overline">Documentaries</Overline>
            <h2 className="font-display font-extrabold uppercase tracking-[-0.01em] text-[clamp(26px,3.6vw,50px)] leading-[1.02] text-bone">
              Stories we've told.
            </h2>
          </div>
          <SectionLink to="/works?type=documentary" testid="docs-view-all-link">
            All documentaries
          </SectionLink>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {told.map((p, i) => (
            <Reveal key={p.slug} delay={i * 0.12}>
              <ProjectCard project={p} large index={i} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ————— FEATURE FILMS ————— */}
      <section data-testid="films-section" className="border-t border-line py-[clamp(80px,12vh,150px)]">
        <div className="mx-auto max-w-[1560px] px-[clamp(18px,4vw,58px)]">
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
                  <ProjectCard project={p} large />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ————— UPCOMING ————— */}
      <section data-testid="upcoming-section" className="border-t border-line bg-ink2/40 py-[clamp(80px,12vh,150px)]">
        <div className="mx-auto max-w-[1560px] px-[clamp(18px,4vw,58px)]">
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
          <div className="mt-12">
            {upcoming.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08}>
                <Link
                  to={`/projects/${p.slug}`}
                  data-testid={`upcoming-row-${p.slug}`}
                  className="group flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-line py-8 transition-colors duration-300 last:border-b hover:bg-ink3/40 md:py-10"
                >
                  <span className="font-mono text-[11px] tracking-[0.2em] text-gold/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="min-w-[200px] flex-1 font-serif text-[clamp(24px,2.6vw,36px)] text-bone transition-transform duration-500 group-hover:translate-x-2">
                    {p.title}
                  </h3>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-bone/50">
                    {[p.type === "feature" ? "Feature Film" : "Documentary", p.location, p.state].filter(Boolean).join(" · ")}
                  </span>
                  <StatusChip status={p.status} />
                  <ArrowUpRight
                    size={18}
                    className="text-bone/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gold"
                  />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ————— STORIES ARE GEMS ————— */}
      <section ref={gemsRef} data-testid="gems-section" className="relative overflow-hidden border-t border-line">
        <motion.img
          src="/assets/projects/gems.jpg"
          alt=""
          aria-hidden="true"
          style={{ y: gemsY }}
          className="absolute inset-0 h-[120%] w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/60 to-ink" />
        <div className="relative mx-auto max-w-[1560px] px-[clamp(18px,4vw,58px)] py-[clamp(110px,16vh,200px)]">
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
              <Link
                to="/submit-story"
                data-testid="gems-cta-btn"
                className="inline-flex items-center gap-3 rounded-sm bg-gold px-8 py-4 text-xs font-medium uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-bone"
              >
                Submit Your Story
                <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ————— WHY WE TELL STORIES ————— */}
      <section data-testid="why-section" className="border-t border-line">
        <div className="mx-auto grid max-w-[1560px] gap-14 px-[clamp(18px,4vw,58px)] py-[clamp(80px,12vh,150px)] lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <Overline testid="why-overline">Why we tell stories</Overline>
            <div className="font-telugu text-[clamp(26px,3vw,40px)] leading-[1.5] text-gold/90">
              ప్రతి కథ ఒక రత్నం
            </div>
            <div className="mt-3 font-mono text-[10px] tracking-[0.24em] text-bone/40">
              EVERY STORY IS A GEM
            </div>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="font-serif text-[clamp(20px,2.2vw,30px)] leading-[1.5] text-bone/90">
              We believe a story doesn't need permission to matter — it needs a patient camera, an honest
              edit, and someone willing to carry it. Balcony Originals exists to be that someone: to preserve
              stories, produce stories, and give strong stories a chance to travel.
            </p>
            <div className="mt-8 font-mono text-[10.5px] tracking-[0.22em] text-bone/40">
              — BALCONY ORIGINALS · PRODUCTION PHILOSOPHY
            </div>
          </Reveal>
        </div>
      </section>

      {/* ————— FINAL CTA ————— */}
      <section data-testid="final-cta-section" className="relative overflow-hidden border-t border-line bg-ink2/40">
        <div className="mx-auto max-w-[1560px] px-[clamp(18px,4vw,58px)] py-[clamp(110px,16vh,190px)] text-center">
          <h2 className="mx-auto max-w-[24ch] font-display font-extrabold uppercase tracking-[-0.02em] text-[clamp(26px,4.4vw,62px)] leading-[1.02] text-bone">
            <MaskLines inView lines={["Every place has a story.", "Every person carries one.", "We're here to tell it."]} lastClassName="text-sand" />
          </h2>
          <Reveal delay={0.4}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-3.5">
              <Link
                to="/works"
                data-testid="final-explore-btn"
                className="rounded-sm bg-bone px-7 py-4 text-xs font-medium uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-gold"
              >
                Explore Stories
              </Link>
              <Link
                to="/submit-story"
                data-testid="final-submit-btn"
                className="rounded-sm border border-bone/30 px-7 py-4 text-xs uppercase tracking-[0.15em] text-bone transition-colors duration-300 hover:border-gold hover:text-gold"
              >
                Submit Your Story
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <ReelModal open={reelOpen} onClose={() => setReelOpen(false)} label="BALCONY ORIGINALS · BRAND FILM" />
    </div>
  );
}
