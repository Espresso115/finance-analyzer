# Task Tracker

## Completed Tasks (Days 1-11)
- [x] Create monorepo root and package manager workspace
- [x] Scaffold React frontend and Node.js API gateway
- [x] Create Python service folder skeletons
- [x] Add pnpm workspace config and Turbo config
- [x] Initialize Docker Compose plan for all infrastructure and basic services
- [x] Create API Gateway health endpoint and middleware
- [x] Implement Node.js → Python service communication test
- [x] Implement database connection manager in API Gateway (MongoDB)
- [x] Define Mongoose models (User, ApiKey, Document, AnalysisHistory)
- [x] Complete Authentication Endpoints (Register/Login) and JWT Route Protection
- [x] Develop User Profile routes (`GET` and `PUT` `/api/v1/users/profile`) and fields validation
- [x] Develop Financial Data Fetching (mock quotes) and Caching setup (Redis with 60s TTL)
- [x] Write and pass comprehensive integration test suite (13/13 tests green)
- [x] Realign Day 6 tracker with Week 1 authentication scope from `BUILD_PLAN_30_DAYS.md`
- [x] Add access-token and refresh-token auth contract (`15m` access, `7d` refresh defaults)
- [x] Add token refresh endpoint (`POST /api/v1/auth/refresh`)
- [x] Add protected logout endpoint (`POST /api/v1/auth/logout`)
- [x] Add password/email validation and conflict response handling
- [x] Add basic RBAC helper (`authorizeRoles`)
- [x] Build frontend auth API client with token injection and refresh-on-401 behavior
- [x] Build Zustand auth store with persisted auth state
- [x] Build login and register forms with React Hook Form + Zod validation
- [x] Build protected route wrapper, dashboard shell, and user menu/logout
- [x] Add frontend auth tests and Day 7 backend auth tests
- [x] Verify full monorepo test suite (20/20 tests passing)
- [x] Add current-user endpoint (`GET /api/v1/users/me`)
- [x] Add self/admin user lookup (`GET /api/v1/users/:userId`)
- [x] Add user settings endpoints (`GET/PUT /api/v1/users/settings`)
- [x] Add password change endpoint (`POST /api/v1/users/change-password`)
- [x] Add avatar upload endpoint (`POST /api/v1/users/avatar`)
- [x] Add account soft delete (`DELETE /api/v1/users/me`)
- [x] Add API key generation, list, and revoke endpoints
- [x] Store API keys as SHA-256 hashes and expose secret only on creation
- [x] Build frontend app shell, profile, settings/password, and API-key pages
- [x] Add API constants, response helpers, request ID middleware, standardized 404, and global error middleware
- [x] Add OpenAPI JSON and lightweight docs page
- [x] Improve frontend API error handling
- [x] Verify full monorepo test suite (30/30 tests passing), frontend lint, and frontend build

## In-Progress Tasks (Day 12 Focus)
- [ ] Add financial data models/endpoints for stocks, forex, crypto, and search
- [ ] Decide external provider integration details while preserving mock quote fallback
- [ ] Refine Redis caching strategy for market data

## Future Tasks (Days 13-30)
- [ ] Add financial data filtering, aggregation, and export endpoints
- [ ] Build financial dashboard, search, watchlist, and visualization UI
- [ ] Build Frontend Dashboard and Watchlists
- [ ] Set up Vector DB (ChromaDB) connection and Document parsing pipeline during the document/RAG phase
- [ ] Integrate local LLM and RAG logic
- [ ] Build Chat/Analysis Interface
- [ ] Achieve production readiness (Testing, CI/CD, Deployment)
