import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { PageHero } from "@/components/PageHero";
import { ProjectCard } from "@/components/ProjectCard";
import { Reveal } from "@/components/Motion";

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

export default function Works() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useSearchParams();
  const active = params.get("type") || params.get("category") || "all";

  useEffect(() => {
    document.title = "Stories & Works — Balcony Originals";
    api
      .projects()
      .then((d) => setProjects(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) => {
    if (active === "all") return true;
    if (active === "documentary" || active === "feature") return p.type === active;
    return (p.categories || []).includes(active);
  });

  const setFilter = (key) => {
    if (key === "all") setParams({});
    else if (key === "documentary" || key === "feature") setParams({ type: key });
    else setParams({ category: key });
  };

  return (
    <div data-testid="works-page">
      <PageHero
        testid="works-hero"
        overline="Stories / Works"
        titleLines={["A living archive."]}
        sub="Documentaries, cultural records, tourism stories and cinema — every project rooted in a real place, told for a wider world."
      />

      <div className="mx-auto max-w-[1560px] px-[clamp(18px,4vw,58px)] pb-[clamp(80px,12vh,150px)]">
        <div data-testid="works-filters" className="flex flex-wrap gap-2.5 border-t border-line pt-8">
          {CHIPS.map((c) => (
            <button
              key={c.key}
              data-testid={`filter-${c.key.toLowerCase()}`}
              onClick={() => setFilter(c.key)}
              className={`rounded-sm border px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em] transition-all duration-300 ${
                active === c.key
                  ? "border-gold bg-gold text-ink"
                  : "border-line text-bone/60 hover:border-gold/60 hover:text-gold"
              }`}
            >
              {c.label}
            </button>
          ))}
          <span className="ml-auto hidden self-center font-mono text-[10px] tracking-[0.2em] text-bone/35 md:block">
            {String(filtered.length).padStart(2, "0")} {filtered.length === 1 ? "STORY" : "STORIES"}
          </span>
        </div>

        {loading ? (
          <div className="py-24 text-center font-mono text-[11px] tracking-[0.3em] text-bone/40">LOADING THE ARCHIVE…</div>
        ) : filtered.length === 0 ? (
          <div data-testid="works-empty" className="border border-dashed border-line py-24 text-center">
            <p className="font-serif text-2xl text-bone/80">Stories in this chapter are still being written.</p>
            <p className="mt-3 font-mono text-[10.5px] tracking-[0.2em] text-bone/40">CHECK BACK SOON</p>
          </div>
        ) : (
          <div data-testid="works-grid" className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p, i) => (
              <Reveal key={p.slug} delay={(i % 3) * 0.1}>
                <ProjectCard project={p} index={i} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
