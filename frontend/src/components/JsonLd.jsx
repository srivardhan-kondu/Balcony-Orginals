/**
 * One <script type="application/ld+json">, ready to render.
 *
 * A Server Component with no state: the structured data is written into the
 * HTML at build time, which is the entire point of it — a crawler that never
 * runs a line of JavaScript still gets the description of what this page is.
 *
 * `JSON.stringify` is what makes injecting it safe: the archive's copy is
 * ordinary prose that can contain any character, and stringify escapes it. The
 * `<` guard covers the one sequence that would otherwise close the script tag
 * early, if a synopsis ever contained it.
 */
export const JsonLd = ({ data }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
  />
);
