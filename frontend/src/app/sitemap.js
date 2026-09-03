import { getProjects } from "@/lib/projects";
import { SITE_URL } from "@/lib/site";

/* ---------------------------------------------------------------------------
   /sitemap.xml, generated from the archive rather than maintained by hand.

   A hand-written sitemap is a list that is correct on the day it is written.
   This one is built from the same source the pages are, so a new story is in it
   the moment the story exists.

   `priority` is a hint and search engines are free to ignore it; it is here to
   state the shape of the site — home first, then the two listings a reader is
   most likely to want, then the individual stories, then the standing pages.
   --------------------------------------------------------------------------- */

export default async function sitemap() {
  const now = new Date();
  const projects = await getProjects();

  const routes = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/works", priority: 0.9, changeFrequency: "weekly" },
    { path: "/upcoming", priority: 0.8, changeFrequency: "weekly" },
    { path: "/submit-story", priority: 0.7, changeFrequency: "monthly" },
    { path: "/about", priority: 0.6, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  ];

  return [
    ...routes.map((r) => ({
      url: `${SITE_URL}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...projects.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })),
  ];
}
