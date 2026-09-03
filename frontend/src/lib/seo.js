/* ---------------------------------------------------------------------------
   Structured data.

   Meta tags tell a crawler what a page is called. Structured data tells it what
   the page is *about* — that Balcony Originals is a production company, that
   "Medaram Jatara" is a documentary with a location and a year, that this page
   sits two levels down from the home page. It is what lets a result appear as
   something richer than a blue link.

   Every builder here returns a plain object. The routes render it inside a
   <script type="application/ld+json">, which means it is in the delivered HTML
   and does not depend on anything running.
   --------------------------------------------------------------------------- */

import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, TAGLINE, absolute } from "@/lib/site";

/** The production house itself. Rendered once, in the root layout. */
export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: "Balcony Originals Production House",
  url: SITE_URL,
  logo: absolute("/favicon-512.png"),
  image: absolute("/assets/bo-lockup.png"),
  description: SITE_DESCRIPTION,
  slogan: TAGLINE,
  address: {
    "@type": "PostalAddress",
    addressRegion: "Andhra Pradesh",
    addressCountry: "IN",
  },
  areaServed: "Worldwide",
  knowsAbout: [
    "Documentary film production",
    "Feature film production",
    "Cultural heritage documentation",
    "Rayalaseema",
    "Telugu cinema",
  ],
});

/** The site as a searchable thing, so the name is attached to the domain. */
export const websiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: "en",
});

/* `Movie` covers both halves of the slate. A documentary is a Movie with a
   genre in schema.org's vocabulary — there is no separate Documentary type —
   and using one type for both keeps the archive listing coherent. */
export const projectJsonLd = (project) => {
  const isFeature = project.type === "feature";
  const place = [project.location, project.district, project.state, project.country].filter(Boolean).join(", ");

  const data = {
    "@context": "https://schema.org",
    "@type": "Movie",
    "@id": `${SITE_URL}/projects/${project.slug}/#movie`,
    url: absolute(`/projects/${project.slug}`),
    name: project.title,
    alternateName: project.telugu || undefined,
    description: project.synopsis || project.logline,
    genre: isFeature ? ["Drama", ...(project.categories || [])] : ["Documentary", ...(project.categories || [])],
    inLanguage: "te",
    countryOfOrigin: { "@type": "Country", name: project.country || "India" },
    productionCompany: { "@id": `${SITE_URL}/#organization` },
    image: absolute(project.hero),
    // `year` is empty on the unannounced feature, and an empty date is worse
    // than no date at all — a validator rejects it.
    datePublished: project.year || undefined,
    creativeWorkStatus: project.status,
    contentLocation: place ? { "@type": "Place", name: place } : undefined,
  };

  if (project.credits?.length) {
    data.director = project.credits
      .filter((c) => /direction|director/i.test(c.role))
      .map((c) => ({ "@type": "Person", name: c.name }));
    if (!data.director.length) delete data.director;
  }

  return data;
};

/** The trail a reader took to get here, shown under the result in search. */
export const breadcrumbJsonLd = (trail) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((crumb, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: crumb.name,
    item: absolute(crumb.path),
  })),
});

/** The archive as an ordered list, so the collection reads as a collection. */
export const collectionJsonLd = ({ name, description, path, projects }) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  url: absolute(path),
  name,
  description,
  isPartOf: { "@id": `${SITE_URL}/#website` },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: projects.length,
    itemListElement: projects.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absolute(`/projects/${p.slug}`),
      name: p.title,
    })),
  },
});
