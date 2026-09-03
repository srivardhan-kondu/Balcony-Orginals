"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, Play } from "lucide-react";
import { api, STATUS_LABELS } from "@/lib/api";
import { Reveal, MaskLines } from "@/components/Motion";
import { MotionStill, Still } from "@/components/Still";
import { SIZES } from "@/lib/images";
import { ProjectCard, StatusChip } from "@/components/ProjectCard";
import { ReelModal } from "@/components/ReelModal";

const Chapter = ({ n, title, body, testid }) =>
  body ? (
    <Reveal>
      <div data-testid={testid} className="border-t border-line py-10 md:py-12">
        <div className="grid gap-6 md:grid-cols-[140px_1fr]">
          <div>
            <span className="font-mono text-[11px] tracking-[0.24em] text-gold/80">{n}</span>
            <h2 className="mt-2 font-serif text-[clamp(20px,2vw,28px)] uppercase tracking-wide text-bone/90">
              {title}
            </h2>
          </div>
          <p className="max-w-[68ch] text-[15px] leading-[1.75] text-mute">{body}</p>
        </div>
      </div>
    </Reveal>
  ) : null;

/**
 * One story.
 *
 * The slug no longer has to be read from the URL and then resolved: the route
 * is generated per project at build time, so the server has already found the
 * story and hands it in whole. That is what puts the synopsis, the chapters and
 * the credits into the delivered HTML — the text a search engine actually has
 * to work with, and which used to arrive a request after the page did.
 *
 * The refresh below still asks the live API, and still lets it win. What it no
 * longer does is decide whether the page exists: a slug that is not in the
 * archive never reaches this component, because the route was never generated
 * and the server answers with the 404 page instead. And a refresh that fails
 * now leaves the story on screen rather than replacing it with one.
 */
export default function ProjectDetail({ project: initialProject, related: initialRelated = [] }) {
  const [project, setProject] = useState(initialProject);
  const [related, setRelated] = useState(initialRelated);
  const [reelOpen, setReelOpen] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);

  const slug = initialProject.slug;

  useEffect(() => {
    let live = true;
    api
      .project(slug)
      .then((p) => {
        if (!live || !p) return;
        setProject(p);
        return api
          .projects({ type: p.type })
          .then((all) => {
            if (live) setRelated(all.filter((x) => x.slug !== p.slug).slice(0, 3));
          });
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [slug]);

  const meta = [
    project.type === "feature" ? "Feature Film" : "Documentary",
    [project.location, project.district].filter(Boolean).join(", "),
    project.state,
    project.year,
  ].filter(Boolean);

  return (
    <div data-testid={`project-detail-${project.slug}`}>
      {/* Hero */}
      <section ref={heroRef} className="relative flex min-h-[92svh] flex-col justify-end overflow-hidden">
        <MotionStill
          src={project.hero}
          alt={project.title}
          sizes={SIZES.full}
          portrait
          fetchPriority="high"
          style={{ y: heroY, scale: heroScale }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/25 to-ink" />
        {/* These ticks frame the content column, so they belong on the same
            gutter it does — pinned at a literal 26px they sat inside the column
            edge at every width above a phone, and at a literal 96px they crossed
            the bar on any viewport where it is shorter than that. */}
        <span aria-hidden="true" className="absolute left-[var(--bo-gutter)] top-[calc(var(--bo-header-h)+clamp(14px,2vh,22px))] h-9 w-9 border-l border-t border-gold/40" />
        <span aria-hidden="true" className="absolute right-[var(--bo-gutter)] top-[calc(var(--bo-header-h)+clamp(14px,2vh,22px))] h-9 w-9 border-r border-t border-gold/40" />

        <div className="relative mx-auto w-full max-w-[1560px] px-[var(--bo-gutter)] pb-[clamp(30px,5vh,60px)] pt-[calc(var(--bo-header-h)+clamp(48px,9vh,104px))]">
          <Reveal>
            <Link
              href="/works"
              data-testid="detail-back-link"
              className="mb-6 inline-flex items-center gap-2.5 py-2 font-mono text-[10.5px] uppercase tracking-[0.2em] text-bone/60 transition-colors hover:text-gold"
            >
              <ArrowLeft size={13} /> All stories
            </Link>
          </Reveal>
          {project.telugu && (
            <Reveal delay={0.05}>
              <div className="mb-3 font-telugu text-lg text-gold/85">{project.telugu}</div>
            </Reveal>
          )}
          <h1
            data-testid="detail-title"
            className="max-w-[16ch] font-display font-extrabold uppercase text-[clamp(30px,6vw,88px)] leading-[0.98] tracking-[-0.02em] text-bone"
          >
            <MaskLines lines={[project.title]} delay={0.1} />
          </h1>
          <Reveal delay={0.3}>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <StatusChip status={project.status} />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-bone/60">
                {meta.join(" · ")}
              </span>
              {(project.categories || []).map((c) => (
                <span
                  key={c}
                  className="rounded-sm border border-bone/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-mute"
                >
                  {c}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.4}>
            <div className="mt-9 flex flex-wrap gap-3.5">
              <button
                onClick={() => setReelOpen(true)}
                data-testid="detail-watch-btn"
                className="group inline-flex items-center gap-3 rounded-sm bg-bone px-6 py-3.5 text-xs font-medium uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-gold"
              >
                <Play size={11} className="fill-current" />
                {project.status === "completed" ? "Watch trailer" : "First look"}
              </button>
              {project.confidential && (
                <span className="inline-flex items-center rounded-sm border border-gold/40 px-4 py-3.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
                  Details under wraps
                </span>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Synopsis */}
      <section className="mx-auto max-w-[1560px] px-[var(--bo-gutter)] py-[clamp(60px,9vh,110px)]">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <Reveal>
            <div className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-bone/60">Synopsis</span>
            </div>
            {project.logline && (
              <p className="mt-6 font-serif text-[clamp(18px,1.8vw,24px)] italic leading-[1.5] text-sand">
                "{project.logline}"
              </p>
            )}
          </Reveal>
          <Reveal delay={0.12}>
            <p className="text-[clamp(16px,1.5vw,20px)] leading-[1.75] text-bone/85">{project.synopsis}</p>
          </Reveal>
        </div>
      </section>

      {/* Chapters */}
      <section className="mx-auto max-w-[1560px] px-[var(--bo-gutter)] pb-[clamp(60px,9vh,110px)]">
        <Chapter n="01" title="The Story" body={project.story} testid="detail-story" />
        <Chapter n="02" title="The Place" body={project.place} testid="detail-place" />
        <Chapter n="03" title="The People" body={project.people} testid="detail-people" />
      </section>

      {/* Gallery */}
      {project.gallery && project.gallery.length > 0 && (
        <section data-testid="detail-gallery" className="mx-auto max-w-[1560px] px-[var(--bo-gutter)] pb-[clamp(60px,9vh,110px)]">
          <Reveal>
            <h2 className="font-serif text-[clamp(22px,2.6vw,38px)] text-bone">Gallery</h2>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {project.gallery.map((g, i) => (
              <Reveal key={g + i} delay={i * 0.08}>
                <div className="group overflow-hidden rounded-sm border border-line" style={{ aspectRatio: "16/10" }}>
                  <Still
                    src={g}
                    alt={`${project.title} — still ${i + 1}`}
                    sizes={SIZES.grid3}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Credits */}
      {project.credits && project.credits.length > 0 && (
        <section data-testid="detail-credits" className="border-t border-line bg-ink2/40">
          <div className="mx-auto max-w-[1560px] px-[var(--bo-gutter)] py-[clamp(60px,9vh,100px)]">
            <Reveal>
              <h2 className="font-serif text-[clamp(22px,2.6vw,38px)] text-bone">Credits</h2>
            </Reveal>
            <div className="mt-8">
              {project.credits.map((c, i) => (
                <Reveal key={c.role} delay={i * 0.06}>
                  <div className="flex flex-wrap items-baseline justify-between gap-3 border-t border-line py-5 last:border-b">
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-mute">{c.role}</span>
                    <span className="font-serif text-lg text-bone/90">{c.name}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Partnership CTA for in-development */}
      {project.confidential && (
        <section data-testid="detail-partnership" className="border-t border-line">
          <div className="mx-auto max-w-[1560px] px-[var(--bo-gutter)] py-[clamp(70px,10vh,120px)] text-center">
            <Reveal>
              <h2 className="mx-auto max-w-[22ch] font-serif text-[clamp(26px,3.6vw,50px)] leading-[1.1] text-bone">
                Producing, co-producing or backing rooted cinema?
              </h2>
              <Link
                href="/contact"
                data-testid="detail-partnership-btn"
                className="mt-9 inline-block rounded-sm bg-gold px-8 py-4 text-xs font-medium uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-bone"
              >
                Start a conversation
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section data-testid="detail-related" className="border-t border-line">
          <div className="mx-auto max-w-[1560px] px-[var(--bo-gutter)] py-[clamp(60px,9vh,110px)]">
            <Reveal>
              <h2 className="font-serif text-[clamp(22px,2.6vw,38px)] text-bone">Related stories</h2>
            </Reveal>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p, i) => (
                <Reveal key={p.slug} delay={i * 0.08}>
                  <ProjectCard project={p} index={i} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <ReelModal
        open={reelOpen}
        onClose={() => setReelOpen(false)}
        label={`${project.title.toUpperCase()} · ${STATUS_LABELS[project.status] || ""}`}
      />
    </div>
  );
}
