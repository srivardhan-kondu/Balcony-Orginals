/** @type {import('next').NextConfig} */

/* Balcony Originals runs as a statically generated site: eight routes, all of
   whose content is known at build time, so every one of them is written to disk
   as real HTML. That is the whole point of the move off create-react-app —
   crawlers, link unfurlers and readers without JavaScript get the page, not an
   empty <div id="root">.

   The live API is still the source of truth at runtime: the page bodies re-fetch
   on mount exactly as they did before, and replace the build-time copy if the
   backend answers. Build-time data is the floor, not the ceiling. */

const nextConfig = {
  reactStrictMode: true,

  /* The repository root carries a lockfile of its own, so Turbopack inferred
     the root one directory up and warned that it might have the wrong one.
     Stated rather than inferred: the frontend is its own package. */
  turbopack: {
    root: __dirname,
  },

  /* The project stills are already served through a hand-built responsive
     ladder (see lib/images.js and scripts/derive_images.py) — a width ladder
     plus a 3:4 portrait crop, both in webp and jpg. Next's own optimiser would
     be a second, redundant pipeline over files that are already derived, so
     the plain <img>/<picture> path stays and the optimiser is left off. */
  images: {
    unoptimized: true,
  },

  /* The stills, the splash and the brand film are content, not build output:
     they are versioned in public/ and change only when the films do. The long
     immutable cache belongs to /_next/static, which Next fingerprints itself;
     these get a day with a week of stale-while-revalidate behind it, matching
     what vercel.json used to declare for the create-react-app build. */
  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
