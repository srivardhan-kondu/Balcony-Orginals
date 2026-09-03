import { notFound } from "next/navigation";
import ProjectDetail from "@/views/ProjectDetail";
import { getProject, getProjects, getProjectSlugs } from "@/lib/projects";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, projectJsonLd } from "@/lib/seo";
import { pageMetadata } from "@/lib/site";

/* One HTML file per story, written at build time. This is the change that
   matters most for the archive: a project page's synopsis, chapters, place,
   people and credits are several hundred words of exactly the prose a search
   engine wants, and until now none of it existed until JavaScript had run and
   a request had come back. */
export const generateStaticParams = async () => (await getProjectSlugs()).map((slug) => ({ slug }));

/* A slug outside the archive is a 404, not a page built on demand — the set of
   stories is finite and known, so anything else is a wrong URL. */
export const dynamicParams = false;

export const generateMetadata = async ({ params }) => {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};

  const kind = project.type === "feature" ? "Feature film" : "Documentary";
  const place = [project.location, project.state].filter(Boolean).join(", ");

  /* The logline is written to be read — it is the one line the film is sold
     on — so it makes a better description than a truncated synopsis. The kind
     and the place are appended because a search result for "Medaram Jatara"
     should say what this page is before it says anything clever. */
  const description = [project.logline, [kind, place, project.year].filter(Boolean).join(" · ")]
    .filter(Boolean)
    .join(" ");

  return pageMetadata({
    title: project.title,
    description,
    path: `/projects/${project.slug}`,
    image: project.hero,
    type: "video.movie",
  });
};

export default async function ProjectPage({ params }) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();

  const all = await getProjects();
  const related = all.filter((p) => p.type === project.type && p.slug !== project.slug).slice(0, 3);

  return (
    <>
      <JsonLd data={projectJsonLd(project)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Stories & Works", path: "/works" },
          { name: project.title, path: `/projects/${project.slug}` },
        ])}
      />
      <ProjectDetail project={project} related={related} />
    </>
  );
}
