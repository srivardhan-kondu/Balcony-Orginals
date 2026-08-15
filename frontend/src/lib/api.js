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

export const api = {
  projects: (params) =>
    axios
      .get(`${API}/projects`, { params })
      .then((r) => r.data)
      .catch(() => filterFallback(params)),
  project: (slug) =>
    axios
      .get(`${API}/projects/${slug}`)
      .then((r) => r.data)
      .catch(() => {
        const p = PROJECTS_FALLBACK.find((x) => x.slug === slug);
        if (!p) throw new Error("not found");
        return p;
      }),
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
