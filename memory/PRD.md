# Balcony Originals — Website PRD

## Original Problem Statement
User uploaded a complete Website Development & Product Vision Brief (v2, Aug 2026) plus an HTML design prototype and brand assets (logo PNGs, intro video, poster). Instruction: rebuild/upgrade freely with 3D premium feel; deliver an *experience*, not just a website — Sony-website-level animations, cinematic loading intro, premium attachment. Awwwards SOTD ambition: kinetic hero with masked line-by-line reveal, numbered manifesto chapters, slow editorial marquee, framer-motion scroll reveals, lenis smooth scrolling, parallax/3D hero.

## User Choices (confirmed)
- 3D: Both — WebGL hero + subtle 3D across site
- Story submission email notifications: skipped for now (DB only)
- Admin panel: skipped for now (submissions stored in DB only)
- Imagery: AI-generated per project (Gemini Nano Banana via Emergent LLM key)

## Architecture
- Frontend: React 19 + Tailwind + framer-motion + lenis + three.js (vanilla WebGL hero), shadcn/sonner toasts
- Backend: FastAPI + MongoDB (motor). Routes all under /api
- Pages: Home, Works (/works), Project Detail (/projects/:slug), Upcoming (/upcoming), Submit Story (/submit-story), About, Contact, 404
- Backend endpoints: GET /api/projects (filters: type/status/category/featured), GET /api/projects/{slug}, POST /api/story-submissions (honeypot, email regex, consent), POST /api/contact
- Seeded projects: proddatur-dussehra, medaram-jatara (completed), yaganti, ahobilam (upcoming), untitled-feature (in-development, confidential)
- Assets: /app/frontend/public/assets/ (brand PNGs + intro mp4) and /assets/projects/*.jpg (15 AI-generated cinematic images)
- Image gen script: /app/scripts/generate_images.py (idempotent; rerun to regenerate missing)

## Design System
- Colors: ink #0C0B0A, bone #F2EDE4, gold #C7A05A, sand #C7B49B, terra #8C3B2B
- Fonts: Marcellus (serif display), Archivo (sans), Noto Serif Telugu (accents), JetBrains Mono (technical)
- Motifs: film grain overlay, viewfinder corner ticks, mono metadata, masked headline reveals, editorial marquee (Telugu + English), slow ember/light-shaft WebGL hero
- Intro: skippable brand video intro (ESC/button), once per session via sessionStorage key `bo-intro-seen`

## Implemented (2026-08-14)
- Full site: all 9 routes, seeded CMS-like project data in MongoDB
- WebGL hero (Three.js embers + light shafts, mouse parallax, reduced-motion fallback)
- Skippable cinematic intro with progress bar and brand video
- Story submission + contact forms with validation, honeypot anti-spam, success states
- Works archive with category/type filters; streaming-style project detail pages (parallax hero, The Story/The Place/The People, gallery, credits, related stories); confidential treatment for in-development feature
- 15 AI-generated cinematic images for all projects/sections

## Verified
- curl: projects list/detail/404, story submission (valid + invalid email 422), contact
- Screenshots: intro→hero, home sections (featured/docs/films/upcoming/gems/why/final CTA), works filters, detail page, upcoming, submit-story full flow (success state), mobile menu
- Fixed: MaskLines in-view reveal (useInView-driven), last-line accent class

## Backlog / Next (P0/P1/P2)
- P0: Swap AI placeholders for real production footage/photos when provided; real brand film/trailer URLs
- P1: Admin dashboard for story submissions (view/mark status) with auth
- P1: Email notifications on story submission (Resend managed integration)
- P1: Full CMS CRUD for projects (move between Completed/Upcoming/In Production/In Development)
- P2: Analytics events, SEO per-project metadata server-side, captions for videos
- P2: Balcony Ecosystem / Balcony X cross-link when that vertical launches
