/* ---------------------------------------------------------------------------
   Reading the archive on the server, at build time.

   This is the half of the data path the browser never runs. Every route is
   statically generated, so each one calls in here once during `next build`,
   gets the archive, and renders real HTML with the stories already in it.

   The browser half is unchanged — `lib/api.js` still fetches on mount and still
   falls back to the same static copy. The two are deliberately separate:

     - here, a failure must not fail the build. The API is a free-tier service
       that cold-starts; a build that dies because it was asleep would be a
       worse outcome than a build carrying the static archive, which is what
       the site shipped with anyway.
     - there, a failure must not blank the page, which is what the shape check
       in api.js is for.

   `axios` is deliberately not used here: this runs in Node during the build,
   `fetch` is native, and a hard timeout matters more than an interceptor stack.
   --------------------------------------------------------------------------- */

import { PROJECTS_FALLBACK } from "@/lib/fallback";
import { UPCOMING_STATUSES } from "@/lib/api";

const BASE = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace(/\/+$/, "");

/* A build should not hang on a sleeping backend. Render's free tier can take
   the best part of a minute to wake, and waiting for it on every route would
   turn a 30-second build into a stalled one. */
const TIMEOUT_MS = 6000;

const byOrder = (a, b) => (a.order ?? 0) - (b.order ?? 0);

let cached = null;

/**
 * The whole archive, ordered.
 *
 * Memoised for the lifetime of the build: eight routes ask for it, and there is
 * no reason for eight round trips to the same endpoint in the same process.
 */
export const getProjects = async () => {
  if (cached) return cached;

  if (BASE) {
    try {
      const res = await fetch(`${BASE}/api/projects`, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
        // The build is the fetch; there is nothing to revalidate against.
        cache: "no-store",
      });
      const data = res.ok ? await res.json() : null;
      /* Same shape check the browser client does, and for the same reason: a
         200 is not proof of an API. A host that answers every path with its
         own HTML would otherwise sail through and take the build down later,
         on `projects.filter(...)`. */
      if (Array.isArray(data) && data.length) {
        cached = [...data].sort(byOrder);
        return cached;
      }
    } catch {
      // Fall through to the static archive — see the note at the top.
    }
  }

  cached = [...PROJECTS_FALLBACK].sort(byOrder);
  return cached;
};

/** One story, or `null` if the slug is not in the archive. */
export const getProject = async (slug) => {
  const all = await getProjects();
  return all.find((p) => p.slug === slug) || null;
};

/** Every slug, for `generateStaticParams` and the sitemap. */
export const getProjectSlugs = async () => (await getProjects()).map((p) => p.slug);

export const getUpcoming = async () =>
  (await getProjects()).filter((p) => UPCOMING_STATUSES.includes(p.status));
