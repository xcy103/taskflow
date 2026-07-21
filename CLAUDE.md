# CLAUDE.md — TaskFlow

Scope & boundary manual for the TaskFlow project. Read this before making changes.

## What this project is

**TaskFlow** — a small full-stack Kanban board (like a stripped-down Trello). A practice
project to build and *show* the skills on a target job description: **MERN stack, JWT auth,
Docker, CI/CD, cloud (Azure), and testing**. It is not meant to be a product — it's meant to
be a clean, real, end-to-end example that each concept can be learned on in depth.

Learning-first, same rhythm as ToolNest: **one or two things a day, done properly (~4h)**.
Hitting a new concept and spending a day learning it is expected and worth logging.

## Tech stack (pinned decisions)

| Layer     | Choice                                                        |
|-----------|---------------------------------------------------------------|
| DB        | MongoDB (via Mongoose). Local: Docker container. Cloud: Azure Cosmos DB for MongoDB (Atlas free tier as fallback). |
| Backend   | Node.js + Express (ES modules).                               |
| Frontend  | React (Vite) + Tailwind CSS.                                  |
| Auth      | **JWT only** — email/password, bcrypt, short-lived access token + refresh token. No OAuth. |
| Tests     | Backend: Jest + Supertest + mongodb-memory-server. Frontend: Vitest + React Testing Library. |
| CI/CD     | GitHub Actions (lint → test → build → docker → deploy).       |
| Container | Docker + docker-compose (local: api + client + mongo).        |
| Cloud     | Azure: App Service / Container Apps (api), Static Web Apps (client), Cosmos DB (data), ACR (images). |

## Repository layout

```
Mern-stack/
├── CLAUDE.md            # this file — scope & conventions
├── ROADMAP.md           # the phased plan; update as things change
├── README.md            # quickstart
├── docker-compose.yml   # local dev: api + client + mongo
├── .env.example         # root-level env template
├── .github/workflows/   # CI/CD pipelines
├── server/              # Express API
│   ├── src/
│   │   ├── models/      # Mongoose schemas (User, Board, List, Card)
│   │   ├── routes/      # Express routers
│   │   ├── controllers/ # request handlers
│   │   ├── middleware/  # auth (JWT verify), error handler
│   │   ├── config/      # db connection, env loading
│   │   ├── app.js       # express app (no listen) — imported by tests
│   │   └── server.js    # entry: app.listen
│   └── tests/           # Jest + Supertest
└── client/              # React (Vite) app
    └── src/
        ├── api/         # fetch wrappers, token handling
        ├── components/  # UI
        ├── pages/       # routed views
        ├── context/     # auth context
        └── ...
```

## Domain model (keep it this small)

- **User** — email, passwordHash, name.
- **Board** — title, owner (User).
- **List** — title, board, position.
- **Card** — title, description, list, position, dueDate?.

Data is **per-user**: every query is scoped to the authenticated user's boards. A user can
never read or mutate another user's data — enforce this in every controller, not just the UI.

## Conventions

- **Language:** JavaScript with ES modules (`import`/`export`) both sides. TypeScript is out
  of scope for now (kept simple; can migrate later).
- **API shape:** REST under `/api`. JSON only. Errors return `{ error: "message" }` with a
  correct HTTP status. A single error-handling middleware formats them.
- **Auth:** `Authorization: Bearer <accessToken>`. Access token ~15 min, refresh token in an
  httpOnly cookie. Never log tokens or password hashes.
- **Config:** everything secret comes from env vars (see `.env.example`). No secrets in git.
- **Tests:** every backend route gets at least one happy-path and one auth-failure test.
- **Commits:** small and frequent, one logical change each. Conventional-ish messages
  (`feat:`, `fix:`, `test:`, `chore:`, `docs:`).

## Boundaries — out of scope (say no to these unless the roadmap changes)

- No real-time / websockets, no team collaboration / sharing, no notifications.
- No payments, no email sending, no file uploads.
- No OAuth / social login (JWT only — this is deliberate).
- No microservices — one API service, one client. Keep the surface small.
- Don't add a dependency when a few lines of plain code will do; when you do add one, note why.

## How to run (once scaffolded)

```
docker compose up          # everything (api + client + mongo) locally
# or, per service:
cd server && npm run dev    # API on :5000
cd client && npm run dev    # client on :5173
```

## Working agreement

- Follow ROADMAP.md phase order; don't jump ahead to Azure before the app runs locally.
- When a phase is done, update ROADMAP.md status and (optional) log the day.
- Prefer clarity over cleverness — this code is meant to be read and explained in interviews.
