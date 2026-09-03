"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { api, UPCOMING_STATUSES } from "@/lib/api";
import { Reveal } from "@/components/Motion";
import { SlateFocus } from "@/components/SlateFocus";

/* The slate arrives with the page — see the note in Works.jsx on why there is
   no loading state left to show. */
export default function Upcoming({ initialProjects = [] }) {
  const [projects, setProjects] = useState(initialProjects);

  useEffect(() => {
    api
      .projects()
      .then((d) => setProjects(d.filter((p) => UPCOMING_STATUSES.includes(p.status))))
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="mx-auto max-w-[1560px] px-[var(--bo-gutter)] pb-[clamp(80px,12vh,150px)]">
        <div data-testid="upcoming-list">
          <SlateFocus projects={projects} />
        </div>

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
              href="/submit-story"
              data-testid="upcoming-submit-btn"
              className="inline-flex items-center gap-3 rounded-sm bg-gold px-7 py-4 text-xs font-medium uppercase tracking-[0.15em] text-ink transition-colors duration-300 hover:bg-bone"
            >
              Submit Your Story <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>
      </div>
    </>
  );
}
