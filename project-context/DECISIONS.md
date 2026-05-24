# Technical Decisions

## Stack Choices & Reasoning
- **Node.js/Express for API Gateway:** Selected for its excellent ecosystem around authentication, WebSockets, rate limiting, and handling high-concurrency lightweight requests.
- **Python/FastAPI for AI Services:** Chosen because the AI/ML ecosystem (LangChain, HuggingFace, embedding models) is natively built in Python. FastAPI provides high performance and ease of integration.
- **React/Vite for Frontend:** Industry standard for dynamic SPAs, offering fast builds and robust typing with TypeScript.
- **MongoDB:** Chosen for flexible schema design, suitable for storing unstructured document metadata, chat histories, and user profiles.
- **ChromaDB:** A dedicated vector database for storing and querying document embeddings for the RAG pipeline.
- **Monorepo (pnpm + turborepo):** Allows for shared configurations, types, and easier orchestration of a multi-language microservices architecture.

## Architectural Constraints
- **Strict Separation of Concerns:** Node.js must not run heavy data processing or NLP tasks. Python must not handle user sessions, JWT validation, or general public API routing.
- **Docker Compatibility:** All services must remain containerizable and rely on `docker-compose.yml` for local orchestration. Avoid local-only dependencies that break container builds.

## Day 6-7 Planning Correction
- Week 1 remains scoped to authentication end-to-end per `BUILD_PLAN_30_DAYS.md`.
- Document ingestion, parser-service implementation, ChromaDB indexing, and RAG work are deferred to the later document/RAG phase.
- The current architecture still intentionally uses Node/Express + MongoDB for the API Gateway rather than migrating to FastAPI + PostgreSQL from the generic build plan language.
- Access tokens and refresh tokens are implemented in the API Gateway; frontend stores them locally for the current development phase and refreshes access tokens on 401 responses.

## Day 8-11 Decisions
- API keys are returned only once on creation; only SHA-256 hashes are stored in MongoDB.
- Account deletion is soft delete (`deletedAt`) and revokes active API keys.
- Avatar uploads are stored locally under `apps/api-gateway/uploads/avatars` for the current local-development phase.
- API standardization was added incrementally through helpers, request IDs, 404/error middleware, and docs endpoints without rewriting all existing working responses.
- OpenAPI is currently maintained as a lightweight in-repo JSON object instead of adding Swagger UI dependencies.
