# Deploying Balcony Originals

Three pieces:

| Piece | Host | Source |
|---|---|---|
| Frontend (React/CRA) | **Vercel** | `frontend/` |
| API (FastAPI) | **Render** | `backend/` |
| Database (MongoDB) | **Atlas** (or any Mongo host) | — |

They are wired together by three environment variables. Deploy the backend
first, because the frontend needs its URL at build time.

---

## 1. Render — the API

Render → **New → Blueprint** → select this repo. It reads [`render.yaml`](render.yaml)
and configures everything (root directory, build command, health check).

Set these in the dashboard when prompted:

| Variable | Value |
|---|---|
| `MONGO_URL` | **Leave blank for now.** Paste the Atlas URI when you have it. |
| `DB_NAME` | `balcony_originals` |
| `CORS_ORIGINS` | Leave blank for now — you'll set it in step 3. |

The service boots green with no database attached: `/api/health` returns 200 with
`"database": "not_configured"`, and the data endpoints return a clean 503 until
you add the URI. Adding `MONGO_URL` later only requires a restart.

Note the URL Render gives you, e.g. `https://balcony-originals-api.onrender.com`.

> **Free plan:** the service sleeps after ~15 min idle, so the first request after
> a quiet spell takes ~50s to wake. Fine for a soft launch; upgrade to Starter
> before you promote the site anywhere.

### Manual setup instead of the blueprint

- Root Directory: `backend`
- Build: `pip install -r requirements.txt`
- Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`
- Health check path: `/api/health`

---

## 2. Vercel — the frontend

Import the repo, then **set Root Directory to `frontend`**. This is the one setting
people miss; without it the build fails because Vercel looks at the repo root.

Everything else comes from [`frontend/vercel.json`](frontend/vercel.json) — build
command, output directory, SPA rewrites (so `/works` and `/projects/:slug` survive
a hard refresh instead of 404ing), and cache headers.

Add one environment variable:

| Variable | Value |
|---|---|
| `REACT_APP_BACKEND_URL` | Your Render URL, **no trailing slash, no `/api`** — e.g. `https://balcony-originals-api.onrender.com` |

> This is inlined into the JS bundle at build time, not read at runtime.
> **Changing it requires a redeploy** — it will not take effect on its own.

---

## 3. Wire CORS back to the frontend

Once Vercel gives you a domain, go back to Render and set:

```
CORS_ORIGINS=https://your-project.vercel.app
```

Comma-separate multiple origins (add your custom domain here too when you attach one):

```
CORS_ORIGINS=https://your-project.vercel.app,https://balconyoriginals.com,https://www.balconyoriginals.com
```

To let Vercel **preview deploys** reach the API as well, also set:

```
CORS_ORIGIN_REGEX=^https://your-project-.*\.vercel\.app$
```

Leaving `CORS_ORIGINS` unset means `*`, which works for basic browsing but should
not be your production setting.

---

## 4. MongoDB Atlas (when you're ready)

1. Create a free M0 cluster.
2. **Database Access** → add a user with a password (avoid `@ : / ?` in it, or
   percent-encode them — unencoded specials break the URI).
3. **Network Access** → allow `0.0.0.0/0`. Render's free tier has no static
   outbound IP, so an IP allowlist won't work.
4. Copy the `mongodb+srv://...` connection string into Render's `MONGO_URL`.

On the next boot the API seeds the five projects automatically — but **only into
an empty collection**. If you later edit `PROJECTS_SEED` in
[`backend/server.py`](backend/server.py), the changes will *not* appear in a
database that already has projects; update the documents directly or drop the
collection first.

---

## Local development

```bash
# API — http://localhost:8000
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt -r requirements-dev.txt
cp .env.example .env          # fill in MONGO_URL, or leave blank
uvicorn server:app --reload --port 8000

# Frontend — http://localhost:3000
cd frontend
yarn install
cp .env.example .env          # REACT_APP_BACKEND_URL=http://localhost:8000
yarn start
```

---

## Before you go public

- **Third-party scripts.** [`frontend/public/index.html`](frontend/public/index.html)
  loads `assets.emergent.sh/scripts/emergent-main.js` and initialises **PostHog
  analytics with session recording**, pointing at the Emergent platform's host
  (`ap.emergent.sh`). These are builder-platform artifacts, not your analytics.
  On your own domain they mean visitor sessions are recorded to a third party —
  worth deleting both `<script>` blocks unless you specifically want them.
- **Imagery is AI-generated placeholders.** All 15 files in
  `frontend/public/assets/projects/` came from
  [`scripts/generate_images.py`](scripts/generate_images.py). Swap in real
  production stills before launch.
- **Submissions are write-only.** Story and contact submissions land in MongoDB
  with no admin UI and no email alert — you'll need to read them in Atlas until
  the admin panel exists.
- **No rate limiting** on the public POST endpoints. The honeypot stops naive
  bots, nothing else does.
