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
