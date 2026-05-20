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
