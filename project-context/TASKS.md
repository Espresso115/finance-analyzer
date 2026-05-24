# Task Tracker

## Completed Tasks (Days 1-7)
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

## In-Progress Tasks (Day 8 Focus)
- [ ] Expand user profile management endpoints and frontend profile page
- [ ] Add API key generation/list/revoke endpoints and management UI
- [ ] Add user settings endpoints and UI

## Future Tasks (Days 9-30)
- [ ] Complete Week 2 user settings, API documentation, and financial dashboard
- [ ] Build Frontend Dashboard and Watchlists
- [ ] Set up Vector DB (ChromaDB) connection and Document parsing pipeline during the document/RAG phase
- [ ] Integrate local LLM and RAG logic
- [ ] Build Chat/Analysis Interface
- [ ] Achieve production readiness (Testing, CI/CD, Deployment)
