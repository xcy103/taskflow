# TaskFlow

[![CI](https://github.com/xcy103/taskflow/actions/workflows/ci.yml/badge.svg)](https://github.com/xcy103/taskflow/actions/workflows/ci.yml)

A small full-stack **Kanban board** (MERN). A practice project built to demonstrate:
MERN stack · JWT auth · testing · Docker · CI/CD · Azure.

> Status: **Phase 0 — foundation.** See [ROADMAP.md](ROADMAP.md) for the plan and
> [CLAUDE.md](CLAUDE.md) for scope & conventions.

## Stack

- **MongoDB** (Mongoose) · **Express** · **React** (Vite + Tailwind) · **Node.js**
- Auth: **JWT** (access + refresh) · Tests: Jest/Supertest + Vitest/RTL
- Docker + docker-compose · GitHub Actions · Azure (App Service / Static Web Apps / Cosmos DB)

## Quickstart (local)

```bash
cp .env.example .env          # then edit secrets
docker compose up mongo       # start MongoDB (until services are dockerized)

# once server/ and client/ are scaffolded (Phase 1+):
cd server && npm install && npm run dev   # API  → http://localhost:5001
cd client && npm install && npm run dev   # app  → http://localhost:5173

# full stack in Docker (Phase 5+):
docker compose up
```

## Layout

```
server/   Express API (models, routes, controllers, middleware, tests)
client/   React app (Vite)
.github/  CI/CD workflows
```

Generate JWT secrets with `openssl rand -hex 32`.
