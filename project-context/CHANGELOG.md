# Changelog

## [Day 1] - 2026-05-19
- Initialized pnpm monorepo structure.
- Created `apps/` and `packages/` directories.
- Scaffolded `api-gateway` (Node/Express) and `frontend` (React/Vite).
- Created folder skeletons for Python AI services and n8n workflows.

## [Day 2] - 2026-05-20
- Finalized `docker-compose.yml` for local infrastructure (MongoDB, Redis, ChromaDB, n8n).
- Added basic `index.js` in `api-gateway` with a `/test-llm` endpoint.
- Added basic `main.py` in `llm-service` with a `/health` endpoint.
- Verified inter-service communication locally.
- Initialized project context memory system.

## [Day 3] - 2026-05-20
- Created MongoDB connection manager (`config/database.js`).
- Integrated `mongoose` and called `connectDB()` before server start in `index.js`.
- Implemented Mongoose Models: `User` (with embedded profile), `ApiKey`, `Document`, and `AnalysisHistory`.
- Added `MONGODB_URI` to local `.env`.

## [Day 4] - 2026-05-20
- Configured JWT secrets in `.env`.
- Created authentication utilities (`bcryptjs` hashing and `jsonwebtoken` token generation).
- Developed `register` and `login` controller methods.
- Implemented `auth.middleware.js` to protect secure routes via Bearer token extraction.
- Mounted `/api/v1/auth` routes onto the API Gateway.
- Integrated `jest` and `supertest` for Edge Case and API drift validation.
- Fixed a MongoDB race condition bug (`E11000`) in the `/register` endpoint caught during automated testing.

## [Day 5] - 2026-05-21
- Added **User Profile** routes (`GET /api/v1/users/profile`, `PUT /api/v1/users/profile`).
- Implemented profile controller and validation logic.
- Added **Market Data** route (`GET /api/v1/market/quote/:symbol`).
- Integrated external market API call with **Redis caching** (TTL 60 s).
- Created centralized Redis client (`src/config/redis.js`).
- Updated `.env` with `REDIS_URL` (already present) – no new DB required.
- Updated `CURRENT_STATE.md`, `day-05.md`, and `TASKS.md` to reflect progress.
- Added comprehensive integration tests (`day05.edge.test.js`); full test suite expanded to 13 tests, all passing (13/13 green).

## [Day 6] - 2026-05-24
- Compared `BUILD_PLAN_30_DAYS.md` against `project-context/` and `progress-tracker/`.
- Found the Day 6 document-ingestion tracker draft was ahead of schedule; Week 1 should finish authentication end-to-end.
- Deferred parser-service/RAG-service/ChromaDB ingestion work to the later document/RAG phase.
- Added access-token and refresh-token auth helpers with default expiries (`15m` access, `7d` refresh).
- Added registration email validation and password strength validation.
- Added `POST /api/v1/auth/refresh`.
- Added protected `POST /api/v1/auth/logout`.
- Added `authorizeRoles(...roles)` middleware for basic RBAC.
- Updated auth tests for refresh-token behavior, logout, validation, and RBAC.

## [Day 7] - 2026-05-24
- Replaced the Vite starter frontend with a real authentication flow.
- Added typed Axios API client with Authorization header injection and 401 refresh retry.
- Added Zustand auth store with persisted user, access token, refresh token, hydrate, refresh, and logout actions.
- Added login and register pages using React Hook Form and Zod.
- Added protected route wrapper, authenticated dashboard shell, and user menu logout.
- Added frontend tests for login/register rendering and protected-route behavior.
- Added `frontend` test script and verified frontend build.
- Verified full monorepo tests: API Gateway 17/17, frontend 3/3, total 20/20 passing.
