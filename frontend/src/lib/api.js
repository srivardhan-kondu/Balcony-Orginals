import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

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
