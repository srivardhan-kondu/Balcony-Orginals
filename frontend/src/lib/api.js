import axios from "axios";
import { PROJECTS_FALLBACK } from "@/lib/fallback";

// REACT_APP_* is inlined at build time, so this is baked into the bundle by Vercel.
// Trailing slashes are stripped, and an unset var falls back to a same-origin "/api"
// rather than producing the string "undefined/api".
const BASE = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/+$/, "");

const API = `${BASE}/api`;

const filterFallback = (params = {}) => {
  let list = [...PROJECTS_FALLBACK];
  if (params.type) list = list.filter((p) => p.type === params.type);
  if (params.status) list = list.filter((p) => p.status === params.status);
  if (params.category) list = list.filter((p) => (p.categories || []).includes(params.category));
  if (params.featured !== undefined) list = list.filter((p) => p.featured === params.featured);
  return list;
};

const fallbackProject = (slug) => {
  const p = PROJECTS_FALLBACK.find((x) => x.slug === slug);
  if (!p) throw new Error("not found");
  return p;
};

/* A 200 is not proof of an API. `vercel.json` rewrites every unmatched path to
   index.html, so with REACT_APP_BACKEND_URL unset at build time the request for
   /api/projects resolves — with the HTML page as its body. That sailed past the
   `.catch` and only failed later, on `projects.filter(...)`, taking the whole
   page down with it. Shape is checked here so a wrong answer falls back like a
   missing one. */
export const api = {
  projects: (params) =>
    axios
      .get(`${API}/projects`, { params })
      .then((r) => (Array.isArray(r.data) ? r.data : filterFallback(params)))
      .catch(() => filterFallback(params)),
  project: (slug) =>
    axios
      .get(`${API}/projects/${slug}`)
      .then((r) => (r.data && typeof r.data === "object" && r.data.slug ? r.data : null))
      .catch(() => null)
      .then((p) => p || fallbackProject(slug)),
  submitStory: (data) => axios.post(`${API}/story-submissions`, data).then((r) => r.data),
  contact: (data) => axios.post(`${API}/contact`, data).then((r) => r.data),
};

export const STATUS_LABELS = {
  completed: "Completed",
  upcoming: "Upcoming",
  "in-production": "In Production",
  "in-development": "In Development",
  "coming-soon": "Coming Soon",
};

export const UPCOMING_STATUSES = ["upcoming", "in-production", "in-development", "coming-soon"];
