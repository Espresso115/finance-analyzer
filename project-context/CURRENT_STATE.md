# Current State

## Detected Progress Level
The project is currently at **Day 11** of development — **Week 2 user management and API architecture baseline complete and verified**.
The Day 6 tracker draft had started planning document/RAG ingestion, but that was ahead of the `BUILD_PLAN_30_DAYS.md` sequence. Week 1 has been realigned around authentication end-to-end, and document ingestion is deferred to the later document/RAG phase.

## Completed Features
- Monorepo structure initialized (pnpm + turborepo).
- React frontend scaffolded (Vite + TypeScript).
- Node.js API Gateway scaffolded with a basic health check and a test route communicating with the LLM service.
- Python LLM service scaffolded with a basic FastAPI setup and health check.
- Other Python services (`rag-service`, `parser-service`, `worker-service`) scaffolded with folder skeletons but no code yet.
- Docker Compose configured for MongoDB, Redis, ChromaDB, n8n, API gateway, and LLM service.
- Initial `.env` files and Git branch workflow (currently on `dev` branch) setup.
- **Mongoose Database Integration:** Completed connection manager and core schemas (User, Document, ApiKey, AnalysisHistory).
- **Authentication System:** Completed `/api/v1/auth/register` and `/login` endpoints using `bcryptjs` and `jsonwebtoken`, along with JWT route protection middleware.
- **Week 1 Authentication Completion (Day 6-7):**
  - Registration and login now return `accessToken`, `refreshToken`, and the legacy `token` alias for compatibility.
  - Access tokens default to 15-minute expiry via `JWT_ACCESS_EXPIRES_IN`.
  - Refresh tokens default to 7-day expiry via `JWT_REFRESH_EXPIRES_IN`.
  - `POST /api/v1/auth/refresh` validates refresh tokens and issues new access tokens.
  - `POST /api/v1/auth/logout` is protected and returns a successful logout response.
  - `protect` validates access tokens only; `authorizeRoles(...roles)` provides basic RBAC.
  - Registration now validates email format and minimum password strength.
- **Automated Validation:** Established a local `jest` integration test suite to automatically validate edge cases, API contract drift, and database concurrency.
- **User Profile Management (Day 5):**
  - `GET /api/v1/users/profile` — Returns sanitized user profile (no `passwordHash`).
  - `PUT /api/v1/users/profile` — Updates allowed fields (`bio`, `avatarUrl`, `company`, `preferences`); ignores privilege-escalation attempts (`role`, `email`).
  - Both routes protected by the `protect` JWT middleware.
- **Market Data & Redis Caching (Day 5):**
  - `GET /api/v1/market/quote/:symbol` — Returns symbol quote data (price, change, volume, timestamp).
  - Results cached in Redis with 60-second TTL via `src/config/redis.js` singleton client.
  - Cache-HIT/MISS behavior verified by test suite via in-memory stub.
- **Frontend Authentication UI (Day 7):**
  - Replaced the Vite starter page with login/register/protected dashboard flow.
  - Added Axios auth client with bearer token injection and 401 refresh retry.
  - Added Zustand auth store with persisted user, access token, refresh token, hydrate, refresh, and logout actions.
  - Added React Hook Form + Zod login/register validation.
  - Added protected route wrapper and user menu logout.
- **User Management (Day 8-9):**
  - `GET /api/v1/users/me` returns the current sanitized user.
  - `GET /api/v1/users/:userId` allows self lookup and admin lookup, blocks other users.
  - `GET/PUT /api/v1/users/settings` handles theme, notification preferences, market alerts, and default watchlist.
  - `POST /api/v1/users/change-password` validates current password before changing.
  - `POST /api/v1/users/avatar` stores image uploads under `apps/api-gateway/uploads/avatars`.
  - `DELETE /api/v1/users/me` soft deletes the user and revokes active API keys.
  - API keys are generated as `fai_...` secrets, stored only as SHA-256 hashes, listed by prefix, and revocable.
- **Frontend Week 2 Screens (Day 8-9):**
  - Added authenticated app shell navigation.
  - Added profile, settings/password, and API-key management pages.
  - Added frontend `.env.example` with `VITE_API_BASE_URL`.
- **API Architecture (Day 10-11):**
  - Added shared API prefix constants.
  - Added response helper utilities for success, error, and paginated responses.
  - Added request ID middleware with `X-Request-Id`.
  - Added standardized 404 and global error middleware.
  - Added OpenAPI JSON at `GET /api/v1/docs/openapi.json`.
  - Added lightweight docs page at `GET /api/v1/docs`.
  - Improved frontend API error extraction and form-level error handling.
- **Full Test Suite (Day 11):** 30/30 tests passing across API Gateway and frontend suites.

## Active Development Focus
Ready to begin **Day 12**: financial data management. Start with financial data models/endpoints and external API integration strategy while preserving the existing protected mock quote route and Redis caching tests.

## Known Issues
- `packages/*` monorepo packages are empty skeletons and need configuration files.
- Python services other than `llm-service` are completely empty.
- `turbo.json` `outputs` key produces cosmetic warnings for test tasks because no coverage files are emitted. Tests still pass.

## Next Tasks
- Day 12: Add financial data models/endpoints for stocks/forex/crypto search and quote history.
- Day 12: Refine external provider strategy around current mock quote service and Redis cache.
- Day 13: Add data filtering/aggregation/export endpoints.
- Day 13-14: Build the financial dashboard, search, watchlist, and visualization UI.
- Defer document upload, PDF parsing, ChromaDB indexing, and RAG integration until the document/RAG phase.
- Optionally configure `turbo.json` test outputs or add coverage output to suppress Turborepo warnings.
