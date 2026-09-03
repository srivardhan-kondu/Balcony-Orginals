import Upcoming from "@/views/Upcoming";
import { PageHero } from "@/components/PageHero";
import { getUpcoming } from "@/lib/projects";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, collectionJsonLd } from "@/lib/seo";
import { pageMetadata } from "@/lib/site";

const TITLE = "Upcoming & In Development";
const DESCRIPTION =
  "The Balcony Originals production slate — documentaries and feature films being researched, walked, recorded and shaped right now.";

export const metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/upcoming",
});

export default async function UpcomingPage() {
  const projects = await getUpcoming();

  return (
    <div data-testid="upcoming-page">
      <JsonLd data={collectionJsonLd({ name: TITLE, description: DESCRIPTION, path: "/upcoming", projects })} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: TITLE, path: "/upcoming" },
        ])}
      />

      <PageHero
        testid="upcoming-hero"
        overline="Upcoming / In development"
        titleLines={["Stories yet", "to be told."]}
        sub="A production slate, not a waiting list. These stories are being researched, walked, recorded and shaped right now."
      />

      <Upcoming initialProjects={projects} />
    </div>
  );
}
