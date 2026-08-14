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
- Colors: MONOCHROME per brand video/logo (v2, user-directed): black #050505, white #FFFFFF, silver greys; accent = pure white. (v1 gold/earth palette replaced)
- Fonts: Archivo ExtraBold uppercase for display headlines (Sony-style), Marcellus serif for editorial quotes, Noto Serif Telugu accents, JetBrains Mono for technical
- Motifs: film grain overlay, viewfinder corner ticks, mono metadata, masked headline reveals, editorial marquee (Telugu + English), white ember/light-shaft WebGL ambience
- Intro: skippable brand video intro (ESC/button), once per session via sessionStorage key `bo-intro-seen`
- Hero (v3): video of the 3D logo assembly plays once, then hands off (guaranteed 9.5s fallback) to HeroMark — a LIVE chrome-metallic 3D "B" rebuilt procedurally in Three.js (extruded shape, beveled, RoomEnvironment reflections, orbiting key light), with spinning spoked film-reel rings in its counters, float + mouse-tilt reactive
- Signature 3D (v2): FilmRing — draggable CSS-3D cylindrical carousel of featured project stills (auto-rotate + pointer drag + inertia), click panel to open project
- Ring feel (v3): friction/fling momentum physics (heavy drag, glide release, cruise settle) + procedural reel-whir via Web Audio (brown noise → bandpass, pitch/volume track spin speed, LFO tape flutter), off by default, toggle button `film-ring-sound-toggle`, no autoplay
- Cinema 3D & scroll system (v4): CineCamera — procedural chrome 35mm cinema camera (body, magazine, twin spoked spinning reels, lens, viewfinder horn) floating in Films section, scroll-drift rotation, IO-gated rendering; FilmRibbon — 3D waving 35mm film-strip ribbon (CanvasTexture sprockets/frames, scroll rolls the film via texture offset + vertex wave) as full-width divider; FootageCounter — fixed camera-HUD "FTG/FR/24FPS" counter ticking with scroll (bottom-right); HeroMark rotation is scroll-linked; all canvases IntersectionObserver-gated, reduced-motion renders one static frame
- Page transitions (v5): ClapperTransition — every route change wipes in a 3D clapperboard (CSS perspective, hinged striped arm snaps shut with a board shake), slate reads SCENE (page name) / TAKE (increments per navigation) / 24 FPS / date, then lifts to reveal the new page; ~1.5s total, timers cleaned up on rapid navigation

## Implemented (2026-08-14, v2)
- Full site: all 9 routes, seeded CMS-like project data in MongoDB
- v2 redesign per user feedback: monochrome palette, video-led hero using their 3D logo animation, bold Archivo display type site-wide, interactive 3D film-ring archive
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
