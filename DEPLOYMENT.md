# Deploying Balcony Originals

Three pieces:

| Piece | Host | Source |
|---|---|---|
| Frontend (Next.js) | **Vercel** | `frontend/` |
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

Vercel detects Next.js and needs no further build configuration;
[`frontend/vercel.json`](frontend/vercel.json) only pins the framework and the
install command. There are no SPA rewrites any more — every route is a real
generated page, so `/works` and `/projects/:slug` survive a hard refresh because
the files exist, not because a catch-all rewrite serves `index.html`.

Add two environment variables:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Your Render URL, **no trailing slash, no `/api`** — e.g. `https://balcony-originals-api.onrender.com` |
| `NEXT_PUBLIC_SITE_URL` | The site's own origin, **no trailing slash** — e.g. `https://balconyoriginals.com` |

> Both are inlined at build time, not read at runtime. **Changing either
> requires a redeploy** — they will not take effect on their own.

`NEXT_PUBLIC_SITE_URL` is the one that is easy to get wrong and expensive to
leave wrong: every canonical tag, `og:url`, sitemap entry and piece of
structured data on the site is absolute and is built from it. Point it at the
domain you actually serve, not at the `*.vercel.app` preview URL.

> **The backend is read at build time too.** `lib/projects.js` asks the API for
> the archive while Vercel is building, so the stories are baked into the HTML.
> It gives up after six seconds and falls back to the static copy in
> `lib/fallback.js` — a sleeping free-tier Render service will not fail the
> build, it will just mean that build ships the archive as committed.

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
cp .env.example .env.local    # NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
yarn dev                      # or: yarn build && yarn start
```

---

## Before you go public

- **Third-party scripts.** [`frontend/src/app/layout.jsx`](frontend/src/app/layout.jsx)
  loads `assets.emergent.sh/scripts/emergent-main.js` and initialises **PostHog
  analytics with session recording**, pointing at the Emergent platform's host
  (`ap.emergent.sh`). These are builder-platform artifacts, not your analytics.
  On your own domain they mean visitor sessions are recorded to a third party —
  worth deleting both `<Script>` blocks unless you specifically want them.
- **Tell Google the site exists.** `robots.txt` and `sitemap.xml` are generated
  ([`app/robots.js`](frontend/src/app/robots.js),
  [`app/sitemap.js`](frontend/src/app/sitemap.js)) and the sitemap is built from
  the archive, so it stays current on its own. Submit it once in Google Search
  Console after the domain is live; nothing else is needed per deploy.
- **Imagery is AI-generated placeholders.** All 15 files in
  `frontend/public/assets/projects/` came from
  [`scripts/generate_images.py`](scripts/generate_images.py). Swap in real
  production stills before launch.
- **Submissions are write-only.** Story and contact submissions land in MongoDB
  with no admin UI and no email alert — you'll need to read them in Atlas until
  the admin panel exists.
- **No rate limiting** on the public POST endpoints. The honeypot stops naive
  bots, nothing else does.
