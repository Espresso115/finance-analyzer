# Architecture

## Detailed Architecture Overview
The platform uses a hybrid microservices/monolithic-gateway approach within a pnpm monorepo.

### 1. Frontend (`apps/frontend`)
- **Stack:** React 18+, TypeScript, Vite, TailwindCSS.
- **Responsibility:** User interface, dashboards, document uploads, and interactive AI chat interfaces.

### 2. Main API Backend (`apps/api-gateway`)
- **Stack:** Node.js, Express.js.
- **Responsibility:** Acts as the primary entry point for the frontend. Handles authentication (JWT), authorization, rate limiting, file uploads, WebSocket connections, and routes specific heavy ML tasks to Python services. 
- **Database:** Connects primarily to MongoDB for user data, document metadata, and chat history. Also uses Redis for caching and queues (BullMQ).

### 3. AI Backend Services (`apps/*-service`)
- **Stack:** Python 3.10+, FastAPI.
- **Services:**
  - `llm-service`: Local LLM inference (e.g., using Ollama).
  - `rag-service`: Retrieval-Augmented Generation pipeline orchestration (LangChain).
  - `parser-service`: Document processing, chunking, and metadata extraction.
  - `worker-service`: Background ML tasks and data processing.
- **Database:** Connects to ChromaDB for vector embeddings.

### 4. Workflow Automation (`apps/n8n`)
- **Stack:** n8n.
- **Responsibility:** External integrations and workflows.

## Infrastructure & Docker Structure
- Orchestrated via `docker-compose.yml` at the root.
- External dependencies (MongoDB, Redis, ChromaDB, n8n) run in standard containers.
- Internal applications are built from their respective `apps/` directories.

## Service Communication Flow
- **Browser** -> **API Gateway** (HTTP/REST or WebSockets)
- **API Gateway** -> **Python AI Services** (Internal HTTP/REST, via Axios, e.g., `http://llm-service:8000`)
- **AI Services** -> **ChromaDB / External APIs**
