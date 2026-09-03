import { Suspense } from "react";
import Works, { WorksGrid } from "@/views/Works";
import { PageHero } from "@/components/PageHero";
import { getProjects } from "@/lib/projects";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, collectionJsonLd } from "@/lib/seo";
import { pageMetadata } from "@/lib/site";

const TITLE = "Stories & Works";
const DESCRIPTION =
  "The Balcony Originals archive — documentaries, cultural records, tourism stories and cinema, every project rooted in a real place and told for a wider world.";

export const metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/works",
});

export default async function WorksPage() {
  const projects = await getProjects();

  return (
    <div data-testid="works-page">
      <JsonLd data={collectionJsonLd({ name: TITLE, description: DESCRIPTION, path: "/works", projects })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: TITLE, path: "/works" },
        ])}
      />

      <PageHero
        testid="works-hero"
        overline="Stories / Works"
        titleLines={["A living archive."]}
        sub="Documentaries, cultural records, tourism stories and cinema — every project rooted in a real place, told for a wider world."
      />

      <div className="mx-auto max-w-[1560px] px-[var(--bo-gutter)] pb-[clamp(80px,12vh,150px)]">
        {/* The filter lives in the query string, which a prerender cannot read,
            so the archive needs a boundary Next can render in its place. The
            fallback is the unfiltered grid rather than a spinner: it is the
            correct content for /works, it is what a crawler is given, and on
            the filtered URLs it is a complete list that narrows on hydration
            instead of an empty frame that fills. */}
        <Suspense fallback={<WorksGrid projects={projects} active="all" />}>
          <Works initialProjects={projects} />
        </Suspense>
      </div>
    </div>
  );
}
