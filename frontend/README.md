# Balcony Originals — frontend

[Next.js](https://nextjs.org) (App Router) + Tailwind, statically generated.

Every route is written to disk as real HTML at build time, including one page
per story in the archive. The live API is still the source of truth at runtime —
the page bodies re-fetch on mount and replace the build-time copy — but the
stories, the metadata and the structured data are in the response before a line
of JavaScript runs.

## Scripts

| | |
|---|---|
| `yarn dev` | Dev server on http://localhost:3000 |
| `yarn build` | Production build — prerenders every route |
| `yarn start` | Serve a production build locally |
| `yarn lint` | ESLint, via `eslint-config-next` |

Copy `.env.example` to `.env.local` before `yarn dev`. Both variables it
documents are inlined at build time, so changing either needs a rebuild.

## Layout

```
src/
  app/                    routes, metadata, sitemap, robots
    layout.jsx            the document — head, scripts, chrome, JSON-LD
    providers.jsx         React Query, Lenis, MotionConfig
    page.jsx              /
    works/                /works
    projects/[slug]/      one generated page per story
    …
  views/                  the page bodies (Client Components)
  components/             shared UI; `ui/` is shadcn
  hooks/
  lib/
    site.js               titles, canonicals, share cards — one source
    seo.js                schema.org builders
    projects.js           the archive, read on the server at build time
    api.js                the archive, re-read in the browser
    fallback.js           the archive as shipped, when the API is unreachable
```

`src/views/` rather than `src/pages/` on purpose: `src/pages/` is the Pages
Router's own directory, and having both would make Next try to route the page
bodies as well as the routes that render them.

## Notes

- **Client Components.** Anything reaching for a hook, a browser API, an event
  handler or framer-motion carries `"use client"`. `Footer`, `PageHero`,
  `Grain` and `Marquee` are Server Components and ship no JavaScript.
- **`useSearchParams` needs a Suspense boundary.** A prerender has no query
  string to read, so Next renders the boundary's fallback into the static HTML
  instead. Where the content matters — the archive grid, the header nav — the
  fallback is the real thing rendered without the query, not a spinner.
- **Images** are served through the hand-built ladder in `lib/images.js`, not
  `next/image`; `scripts/derive_images.py` writes the derivatives. Next's
  optimiser is off in `next.config.js` so the two do not overlap.
