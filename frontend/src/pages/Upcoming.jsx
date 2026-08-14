import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { api, UPCOMING_STATUSES } from "@/lib/api";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Motion";
import { StatusChip } from "@/components/ProjectCard";

export default function Upcoming() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Upcoming & In Development — Balcony Originals";
    api
      .projects()
      .then((d) => setProjects(d.filter((p) => UPCOMING_STATUSES.includes(p.status))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="upcoming-page">
      <PageHero
        testid="upcoming-hero"
        overline="Upcoming / In development"
        titleLines={["Stories yet", "to be told."]}
        sub="A production slate, not a waiting list. These stories are being researched, walked, recorded and shaped right now."
      />

      <div className="mx-auto max-w-[1560px] px-[clamp(18px,4vw,58px)] pb-[clamp(80px,12vh,150px)]">
        {loading ? (
          <div className="py-24 text-center font-mono text-[11px] tracking-[0.3em] text-bone/40">LOADING THE SLATE…</div>
        ) : (
          <div data-testid="upcoming-list">
            {projects.map((p, i) => (
              <Reveal key={p.slug} delay={i * 0.08}>
                <Link
                  to={`/projects/${p.slug}`}
                  data-testid={`upcoming-card-${p.slug}`}
                  className="group relative block overflow-hidden border-t border-line py-12 transition-colors duration-300 last:border-b hover:bg-ink3/30 md:py-16"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-4 top-1/2 hidden -translate-y-1/2 select-none font-serif text-[clamp(70px,9vw,150px)] uppercase leading-none text-bone/[0.045] lg:block"
                  >
                    {(p.status || "").replace("-", " ")}
                  </span>
                  <div className="relative grid items-center gap-6 md:grid-cols-[80px_1.4fr_1fr_auto]">
                    <span className="font-mono text-sm tracking-[0.2em] text-gold/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2 className="font-serif text-[clamp(26px,3.4vw,48px)] leading-[1.05] text-bone transition-transform duration-500 group-hover:translate-x-2">
                        {p.title}
                      </h2>
                      <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-mute">{p.logline}</p>
                    </div>
                    <div className="font-mono text-[10px] uppercase leading-[2.1] tracking-[0.2em] text-bone/50">
                      {p.type === "feature" ? "FEATURE FILM" : "DOCUMENTARY"}
                      <br />
                      {[p.location, p.state].filter(Boolean).join(" · ").toUpperCase()}
                      {p.year && (
                        <>
                          <br />
                          {p.year}
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-5">
                      <StatusChip status={p.status} />
                      <ArrowUpRight
                        size={20}
                        className="text-bone/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gold"
                      />
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal delay={0.1}>
          <div
            data-testid="upcoming-cta"
            className="mt-16 flex flex-col items-center gap-7 rounded-sm border border-dashed border-gold/30 bg-ink2/40 px-6 py-16 text-center"
          >
            <h3 className="font-serif text-[clamp(20px,2.2vw,30px)] text-bone">
              Know a story that belongs on this page?
            </h3>
            <p className="max-w-[48ch] text-sm leading-relaxed text-mute">
              Some of our best projects began as a stranger's one-line message. Yours could be next.
            </p>
            <Link
              to="/submit-story"
              data-testid="upcoming-submit-btn"
              className="inline-flex items-center gap-3 rounded-sm bg-gold px-7 py-4 text-xs font-medium uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-bone"
            >
              Submit Your Story <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
