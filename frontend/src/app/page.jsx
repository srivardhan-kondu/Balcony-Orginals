import Home from "@/views/Home";
import { getProjects } from "@/lib/projects";
import { JsonLd } from "@/components/JsonLd";
import { collectionJsonLd } from "@/lib/seo";
import { SITE_NAME, TAGLINE, SITE_DESCRIPTION, pageMetadata } from "@/lib/site";

/* The home page keeps the house name first — it is the one route where the
   brand *is* the subject, so the title template is overridden with a literal. */
export const metadata = {
  ...pageMetadata({
    title: `${SITE_NAME} — ${TAGLINE}`,
    description: SITE_DESCRIPTION,
    path: "/",
  }),
  title: { absolute: `${SITE_NAME} — ${TAGLINE}` },
};

export default async function HomePage() {
  const projects = await getProjects();

  return (
    <>
      <JsonLd
        data={collectionJsonLd({
          name: `${SITE_NAME} — ${TAGLINE}`,
          description: SITE_DESCRIPTION,
          path: "/",
          projects,
        })}
      />
      <Home initialProjects={projects} />
    </>
  );
}
