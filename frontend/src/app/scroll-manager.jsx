"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/* Lenis takes the page's scroll position over, so the App Router's own restore
   never reaches it — arriving at a new route left the reader wherever the last
   one had them. This is the same reset App.js did on every location change,
   asked of Lenis first and the window only if Lenis is not running (which is
   the case under reduced motion, where it is never started).

   It renders nothing, so its Suspense fallback in the layout is `null` and it
   costs the prerendered HTML nothing. */
export const ScrollManager = () => {
  const pathname = usePathname();
  const query = useSearchParams().toString();

  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname, query]);

  return null;
};
