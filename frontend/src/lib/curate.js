/* ---------------------------------------------------------------------------
   Stills taken off the project pages.

   The backend only seeds its database once, so a live database can still list
   a photo after it has been removed from the seed. Every project read — the
   build-time one in lib/projects.js and the browser one in lib/api.js — passes
   through `curate`, so a still listed here never reaches a page either way.
   --------------------------------------------------------------------------- */

const RETIRED_STILLS = new Set([
  // Full-crew group photo, removed from the Proddatur Dussehra page.
  "/assets/projects/proddatur-g3.jpg",
]);

export const curate = (project) =>
  project && Array.isArray(project.gallery)
    ? { ...project, gallery: project.gallery.filter((g) => !RETIRED_STILLS.has(g)) }
    : project;

export const curateAll = (projects) => projects.map(curate);
