"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Motion";
import { skipNextTake } from "@/components/ClapperTransition";

const CHIPS = [
  { key: "all", label: "All" },
  { key: "documentary", label: "Documentaries" },
  { key: "feature", label: "Feature Films" },
  { key: "Devotional", label: "Devotional" },
  { key: "Cultural", label: "Cultural" },
  { key: "Heritage", label: "Heritage" },
  { key: "Tourism", label: "Tourism" },
  { key: "People", label: "People" },
];

const filterProjects = (projects, active) =>
  projects.filter((p) => {
    if (active === "all") return true;
    if (active === "documentary" || active === "feature") return p.type === active;
    return (p.categories || []).includes(active);
  });

/* The grid on its own, so the same markup serves two callers: the archive
   below, and the Suspense fallback the server prerenders in its place. */
export const WorksGrid = ({ projects, active = "all" }) => {
  const filtered = filterProjects(projects, active);

  return (
    <>
      <div data-testid="works-filters" className="flex flex-wrap gap-2.5 border-t border-line pt-8">
        {CHIPS.map((c) => (
          <span
            key={c.key}
            className={`inline-flex min-h-[44px] items-center rounded-sm border px-4 font-mono text-[10.5px] uppercase tracking-[0.18em] ${
              active === c.key ? "border-gold bg-gold text-ink" : "border-line text-bone/70"
            }`}
          >
            {c.label}
          </span>
        ))}
        <span className="ml-auto hidden self-center font-mono text-[10px] tracking-[0.2em] text-mute md:block">
          {String(filtered.length).padStart(2, "0")} {filtered.length === 1 ? "STORY" : "STORIES"}
        </span>
      </div>
      <ArchiveGrid filtered={filtered} />
    </>
  );
};

const ArchiveGrid = ({ filtered }) =>
  filtered.length === 0 ? (
    <div data-testid="works-empty" className="border border-dashed border-line py-24 text-center">
      <p className="font-serif text-2xl text-bone/80">Stories in this chapter are still being written.</p>
      <p className="mt-3 font-mono text-[10.5px] tracking-[0.2em] text-mute">CHECK BACK SOON</p>
    </div>
  ) : (
    <div
      data-testid="works-grid"
      /* `lg` rather than `xl`, to match the gallery and related grids on
         the project pages — between 1024 and 1280 the archive was the
         only place in the app that stayed two-up, at nearly 700px a card. */
      className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {filtered.map((p, i) => (
        <Reveal key={p.slug} delay={(i % 3) * 0.1}>
          <ProjectCard project={p} index={i} />
        </Reveal>
      ))}
    </div>
  );

/**
 * The archive, filterable.
 *
 * There is no loading state left to show: the grid arrives with the page,
 * rendered on the server from the build-time archive, and the request below
 * only refreshes it. The empty state stays — a filter can genuinely match
 * nothing, which is a different thing from not having asked yet.
 */
export default function Works({ initialProjects = [] }) {
  const [projects, setProjects] = useState(initialProjects);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const active = params.get("type") || params.get("category") || "all";

  useEffect(() => {
    api.projects().then(setProjects).catch(() => {});
  }, []);

  const filtered = filterProjects(projects, active);

  /* `replace`, not push, and for two reasons. Refining the list in place is not
     a journey, so it should not stack up in history — a reader who tried four
     filters expects Back to leave the archive, not to walk them back through
     all four. `skipNextTake` is the other half: these write the same query
     string the FILMS nav link does, and without it the clapperboard would run a
     1.5s take between "show me documentaries" and "show me features".

     The jump back to the top of the archive is deliberate and pre-existing:
     ScrollManager resets the scroll on any change of location, query included,
     so a new filter always starts the list from its first card. */
  const setFilter = (key) => {
    const query =
      key === "all" ? "" : key === "documentary" || key === "feature" ? `?type=${key}` : `?category=${encodeURIComponent(key)}`;
    skipNextTake();
    router.replace(`${pathname}${query}`);
  };

  return (
    <>
      <div data-testid="works-filters" className="flex flex-wrap gap-2.5 border-t border-line pt-8">
        {CHIPS.map((c) => (
          <button
            key={c.key}
            data-testid={`filter-${c.key.toLowerCase()}`}
            onClick={() => setFilter(c.key)}
            aria-pressed={active === c.key}
            className={`inline-flex min-h-[44px] items-center rounded-sm border px-4 font-mono text-[10.5px] uppercase tracking-[0.18em] transition-all duration-300 ${
              active === c.key
                ? "border-gold bg-gold text-ink"
                : "border-line text-bone/70 hover:border-gold/60 hover:text-gold"
            }`}
          >
            {c.label}
          </button>
        ))}
        <span className="ml-auto hidden self-center font-mono text-[10px] tracking-[0.2em] text-mute md:block">
          {String(filtered.length).padStart(2, "0")} {filtered.length === 1 ? "STORY" : "STORIES"}
        </span>
      </div>
      <ArchiveGrid filtered={filtered} />
    </>
  );
}
