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

## [Day 8] - 2026-05-24
- Added current-user endpoint: `GET /api/v1/users/me`.
- Added protected user lookup: `GET /api/v1/users/:userId` for self/admin access.
- Added user settings endpoints: `GET /api/v1/users/settings`, `PUT /api/v1/users/settings`.
- Added password change endpoint: `POST /api/v1/users/change-password`.
- Added avatar upload endpoint: `POST /api/v1/users/avatar`.
- Added account soft delete endpoint: `DELETE /api/v1/users/me`.
- Extended user preferences with market alerts and default watchlist.
- Added frontend app shell navigation plus profile and settings/password pages.

## [Day 9] - 2026-05-24
- Added API key generation using `fai_...` random secrets.
- Store API keys as SHA-256 hashes only.
- Added API key prefix, revoked timestamp, and last-used metadata.
- Added `GET /api/v1/users/api-keys`, `POST /api/v1/users/api-keys`, and `DELETE /api/v1/users/api-keys/:keyId`.
- Added frontend API key management page.
- Added Day 8-9 API test coverage; API Gateway reached 24 passing tests at this checkpoint.

## [Day 10] - 2026-05-24
- Added API constants in `src/config/app.js`.
- Mounted API routes through shared `/api/v1` prefix constants.
- Added response helper utilities for success, error, and paginated responses.
- Added request ID middleware and `X-Request-Id` response header.
- Added standardized 404 and global error middleware.

## [Day 11] - 2026-05-24
- Added OpenAPI JSON endpoint at `GET /api/v1/docs/openapi.json`.
- Added lightweight API docs page at `GET /api/v1/docs`.
- Documented auth, users/settings/API-key, and market quote routes.
- Added frontend `.env.example` with `VITE_API_BASE_URL`.
- Improved frontend API error parsing for legacy and standardized error response shapes.
- Added form-level errors to profile, settings/password, and API-key frontend pages.
- Verified final Day 11 state: `pnpm test` passes (API Gateway 27/27, frontend 3/3), `pnpm --filter frontend lint` passes, and `pnpm --filter frontend build` passes.
