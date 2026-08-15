import axios from "axios";

// REACT_APP_* is inlined at build time, so this is baked into the bundle by Vercel.
// Trailing slashes are stripped, and an unset var falls back to a same-origin "/api"
// rather than producing the string "undefined/api".
const BASE = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/+$/, "");

const API = `${BASE}/api`;

export const api = {
  projects: (params) => axios.get(`${API}/projects`, { params }).then((r) => r.data),
  project: (slug) => axios.get(`${API}/projects/${slug}`).then((r) => r.data),
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
