import NotFound from "@/views/NotFound";

/* The 404 is the one page that must not be indexed, and Next's own default
   would have left it inheriting the site title. `noindex, follow` is the right
   pair: keep it out of results, but let a crawler that lands here follow the
   link back into the archive. */
export const metadata = {
  title: "404",
  description: "This story hasn't been told yet.",
  robots: { index: false, follow: true },
};

export default function NotFoundPage() {
  return <NotFound />;
}
