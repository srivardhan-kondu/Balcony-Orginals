import { SITE_URL } from "@/lib/site";

/* /robots.txt. Everything is open — there is no admin surface and no private
   route on this site — and the sitemap is named so a crawler does not have to
   guess at it. */
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
