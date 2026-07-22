# TaskFlow — Roadmap

A phased plan for building **TaskFlow**, a small MERN Kanban board. Goal: a clean end-to-end
project that demonstrates the target job skills — **MERN, JWT, testing, Docker, CI/CD, Azure** —
without bloat. Same rhythm as ToolNest: **one or two things a day, done in depth (~4h)**,
learning as I go.

This file is a guide, not a contract — update it as things change.

## Principles

- **Local-first.** Get the whole thing running locally (Docker) before touching the cloud.
- **Vertical slices.** Build auth end-to-end, then a board end-to-end — each slice touches
  DB → API → UI so I actually see it work.
- **Test as I build**, not at the end. Every route gets a happy-path + an auth-failure test.
- **Learn each concept once, deliberately.** JWT, Docker, GitHub Actions, Azure are each a
  focused learning day — logged.

---

## Phase 0 — Foundation ✅ (this)

Repo skeleton, `CLAUDE.md` (scope), this roadmap, and config files: `.gitignore`,
`.env.example`, `docker-compose.yml`, CI workflow stub. No app code yet.

## Phase 1 — Backend + Auth (JWT) ✅  — ~3 days

The backbone. A running Express API talking to MongoDB, with real auth. **Done** — register/
login/refresh, `authRequired` middleware, `/api/me`, central error handler; 13 tests passing.

- **Day 1 — API skeleton + DB.** `npm init` in `server/`; Express app split into
  `app.js` (no listen, testable) + `server.js`; Mongoose connection to Dockerized Mongo;
  a `/api/health` route. Confirm it comes up.
- **Day 2 — Auth: register + login.** `User` model, bcrypt password hashing,
  `POST /api/auth/register`, `POST /api/auth/login` returning a JWT access token +
  httpOnly refresh cookie. **Learn:** how JWT works (header/payload/signature), why refresh
  tokens exist.
- **Day 3 — Protect routes + refresh.** `authRequired` middleware verifying the Bearer
  token; `POST /api/auth/refresh`; central error-handling middleware. A `/api/me` route
  proves the whole chain.

## Phase 2 — Boards, Lists, Cards (CRUD) ✅  — ~2–3 days

The core data, all scoped to the logged-in user. **Done** — boards/lists/cards CRUD, ownership
isolation, cascade deletes, and card move/reorder; 30 tests passing.

- **Day 4 — Boards + Lists.** Models + REST routes; every query filtered by `owner`.
- **Day 5 — Cards.** Card model + routes; `position` field for ordering within a list.
- **Day 6 — Move/reorder.** Endpoint to move a card between lists / reorder (update
  positions). Keep the ordering logic simple and documented.

## Phase 3 — Frontend (React) ✅  — ~3–4 days

**Done** — auth (login/register, session restore), boards list, board view with lists/cards,
card CRUD, drag-and-drop reorder/move (@dnd-kit), and polish (spinner/error/empty states).

- **Day 7 — Vite + Tailwind + routing.** Scaffold `client/`; login & register pages;
  auth context storing the access token; a fetch wrapper that attaches the Bearer token
  and handles 401 → refresh.
- **Day 8 — Board view.** List boards, create a board, open one showing its lists & cards.
- **Day 9 — Card interactions.** Add/edit/delete cards; **drag-and-drop** to reorder /
  move between lists (`@dnd-kit`). **Learn:** drag-and-drop + optimistic UI.
- **Day 10 — Polish.** Loading/empty/error states, responsive layout, small niceties.

## Phase 4 — Testing ✅  — ~2 days

**Done** — backend: 36 Jest/Supertest tests + enforced coverage floor; frontend: 6
Vitest/RTL tests (login form, board rendering, card interaction) with the API mocked.

- **Day 11 — Backend tests.** Jest + Supertest + `mongodb-memory-server`: auth flow,
  and CRUD with the auth-failure cases (can't touch another user's board). Add coverage.
- **Day 12 — Frontend tests.** Vitest + React Testing Library: login form, board rendering,
  a card interaction. Mock the API layer.

## Phase 5 — Docker + CI/CD ✅  — ~2 days

**Done** — multi-stage Dockerfiles + `docker compose up` runs the whole stack; GitHub Actions
runs lint, backend coverage, frontend tests, and builds both images on every push (green).

- **Day 13 — Dockerize.** `Dockerfile` for `server/` (multi-stage) and `client/` (build →
  static); finalize `docker-compose.yml` (api + client + mongo). `docker compose up` runs
  the whole app.
- **Day 14 — GitHub Actions.** CI pipeline: install → lint → test (both) → build →
  build Docker image. Branch protection so the pipeline must pass. **Learn:** Actions
  workflow syntax, caching, matrix.

## Phase 6 — Azure deployment ✅  — ~2–3 days

**Done & live** — React on Static Web Apps, API on Container Apps (image in ACR), data in
Cosmos DB (serverless). Both frontend and API auto-deploy via GitHub Actions. CORS wired to
the live origin. Live: https://mango-mud-0d7386d0f.7.azurestaticapps.net

Bring it to the cloud. This is the "cloud platform" resume line.

- **Day 15 — Provision.** Azure Container Registry (images), Azure Cosmos DB for MongoDB
  (data; Atlas free tier as fallback), and the compute: App Service / Container Apps for the
  API, Static Web Apps for the client. **Learn:** Azure resource groups, the portal + `az` CLI.
- **Day 16 — Deploy via CI/CD.** Extend Actions: push the API image to ACR and deploy to
  App Service/Container Apps; deploy the client to Static Web Apps. Secrets via GitHub
  Actions secrets + Azure app settings. Live URL working end-to-end.
- **Day 17 — Buffer / harden.** CORS for the real domains, env config, a smoke test against
  the deployed URL. Write up the architecture in the README.

## Phase 7 — Performance & polish (optional)  — ~1–2 days

- DB indexes (owner, board, list); pagination if lists get long.
- Frontend: code-split routes, memoize the board, a Lighthouse pass.
- Rate-limit auth endpoints; basic security headers (helmet).

---

## Skills → where they show up (for the résumé)

- **MERN** — the whole app.
- **JWT auth** — Phase 1 (access + refresh, protected routes).
- **Testing** — Phase 4 (Jest/Supertest + Vitest/RTL, coverage).
- **Docker** — Phase 5 (multi-stage builds, compose).
- **CI/CD** — Phase 5–6 (GitHub Actions: test → build → deploy).
- **Cloud (Azure)** — Phase 6 (ACR, Cosmos DB, App Service/Container Apps, Static Web Apps).
- **Performance optimization** — Phase 7 (indexes, code-splitting, Lighthouse).
