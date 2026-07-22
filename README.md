# TaskFlow

[![CI](https://github.com/xcy103/taskflow/actions/workflows/ci.yml/badge.svg)](https://github.com/xcy103/taskflow/actions/workflows/ci.yml)

A small full-stack **Kanban board** (MERN). A practice project built to demonstrate:
MERN stack · JWT auth · testing · Docker · CI/CD · Azure.

**🌐 Live demo:** https://mango-mud-0d7386d0f.7.azurestaticapps.net

> Deployed on Azure — React on **Static Web Apps**, the API on **Container Apps**,
> data in **Cosmos DB for MongoDB**. The API scales to zero, so the first request
> after it's been idle takes a few seconds to warm up.

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

## Deployment (Azure)

```
Browser ──▶ Static Web Apps (React)  ──▶  Container Apps (Express API)  ──▶  Cosmos DB (Mongo)
             mango-mud-…azurestaticapps.net   taskflow-api.…azurecontainerapps.io   serverless
```

- **Frontend** → Azure **Static Web Apps** (Free). Auto-deploys via
  [`deploy-web.yml`](.github/workflows/deploy-web.yml); the API URL is baked in at build time.
- **API** → Azure **Container Apps** (scales to zero). Image built and pushed to **ACR**, then
  rolled out by [`deploy-api.yml`](.github/workflows/deploy-api.yml) on every push to `server/**`.
- **Database** → Azure **Cosmos DB for MongoDB** (serverless).
- Secrets (Mongo URI, JWT keys) are Container App secrets; GitHub Actions auth uses a
  resource-group–scoped service principal (`AZURE_CREDENTIALS`).

**Tear down all Azure resources** when finished:

```bash
az group delete -n taskflow-rg --yes
```
