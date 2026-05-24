# Current State

## Detected Progress Level
The project is currently at **Day 7** of development — **Week 1 authentication milestone complete and verified**.
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
- **Full Test Suite (Day 7):** 20/20 tests passing across API Gateway and frontend suites.

## Active Development Focus
Week 1 is complete. Ready to begin **Week 2 / Day 8**: user management/profile expansion, API key management, user settings, and related frontend pages.

## Known Issues
- `packages/*` monorepo packages are empty skeletons and need configuration files.
- Python services other than `llm-service` are completely empty.
- `turbo.json` `outputs` key produces cosmetic warnings for test tasks because no coverage files are emitted. Tests still pass.

## Next Tasks
- Day 8: Build current-user/profile endpoints and frontend profile page.
- Day 8-9: Add API key management endpoints/UI and user settings.
- Defer document upload, PDF parsing, ChromaDB indexing, and RAG integration until the document/RAG phase.
- Optionally configure `turbo.json` test outputs or add coverage output to suppress Turborepo warnings.
