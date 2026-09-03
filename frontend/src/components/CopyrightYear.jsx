"use client";

/* The year, read from the reader's clock rather than the build's.

   The footer is otherwise a Server Component — it is the block that carries
   every primary link into the delivered HTML, and it should cost no JavaScript
   to do it. But `new Date().getFullYear()` evaluated on the server is the year
   the site was *built*, which would quietly go stale on the first of January
   and stay stale until something else prompted a deploy.

   So the one value that has to be live is the only part that hydrates.
   `suppressHydrationWarning` is the point rather than a workaround: the
   prerendered year and the rendered year are *expected* to differ across a new
   year, and React is being told that the difference is intentional. */
export const CopyrightYear = () => (
  <span suppressHydrationWarning>{new Date().getFullYear()}</span>
);
