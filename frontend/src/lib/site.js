/* ---------------------------------------------------------------------------
   The facts about the site that both the metadata and the structured data need
   to agree on.

   Titles, descriptions and canonical URLs used to be set from inside a
   `useEffect` — after the page had already been delivered — which meant only a
   crawler that ran JavaScript ever saw them, and every link shared anywhere
   unfurled as a bare URL. They live here now, are read by the `metadata`
   exports of each route, and are baked into the HTML at build time.

   SITE_URL must be absolute for canonical tags, `og:url` and the sitemap to be
   valid. Set NEXT_PUBLIC_SITE_URL on the host; the literal is the production
   domain and the sane default when it is missing.
   --------------------------------------------------------------------------- */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://balconyoriginals.com").replace(/\/+$/, "");

export const SITE_NAME = "Balcony Originals";

export const TAGLINE = "Stories rooted in culture. Told for the world.";

/* The one-line description. Kept under ~160 characters: past that, search
   results truncate it mid-sentence. */
export const SITE_DESCRIPTION =
  "Balcony Originals — stories rooted in culture, told for the world. Documentaries, feature films and original stories from Rayalaseema, India.";

/* The default share image. Every page can override it; a project page does,
   with its own hero. Pass a master path — `shareImage` below picks the right
   file, so callers can hand over the same `project.hero` the page renders. */
export const DEFAULT_OG_IMAGE = "/assets/projects/hero.jpg";

/* Every project still is authored as one 1584x672 master with a width ladder
   derived beside it (see lib/images.js). The masters run to ~900KB apiece; the
   1200w rung is the same picture at ~120KB, and 1200px wide is what both
   Facebook and X ask for.

   Handing a crawler the master instead is a real cost and an easy one to miss,
   because nothing on the page is slow — it is only the unfurl that drags, in
   somebody else's chat window. */
const OG_WIDTH = 1200;
const OG_HEIGHT = 509; // 1200 x (672/1584), the master's own 2.36:1

export const shareImage = (src = DEFAULT_OG_IMAGE) => {
  const master = /^(\/assets\/projects\/[a-z0-9-]+)\.jpg$/i.exec(src);
  return master ? `${master[1]}-${OG_WIDTH}w.jpg` : src;
};

export const LOCALE = "en_IN";

/** An absolute URL for a path that may be relative. */
export const absolute = (path = "/") =>
  path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * The shared half of every route's `metadata`.
 *
 * Pass a path and the page's own title and description; canonical, Open Graph
 * and Twitter card all follow from them rather than being retyped per route
 * and drifting apart.
 */
export const pageMetadata = ({ title, description, path = "/", image = DEFAULT_OG_IMAGE, type = "website" }) => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    type,
    url: absolute(path),
    siteName: SITE_NAME,
    title,
    description,
    locale: LOCALE,
    images: [{ url: absolute(shareImage(image)), width: OG_WIDTH, height: OG_HEIGHT, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [absolute(shareImage(image))],
  },
});
