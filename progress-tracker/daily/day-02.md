# Day 2 - Local Runtime Environment & Service Communication

Date: 2026-05-20  
Status: Completed

---

# Goal

Set up the local runtime environment for the Financial AI Platform using Docker Compose, establish communication between the Node.js API Gateway and Python LLM service, and initialize core infrastructure services.

---

# Checklist

- [x] Create Express API Gateway health endpoint
- [x] Configure Express middleware and environment loading
- [x] Install and configure Axios for service communication
- [x] Create FastAPI LLM service
- [x] Create Python virtual environment
- [x] Install FastAPI and Uvicorn
- [x] Verify standalone health checks for API Gateway
- [x] Verify standalone health checks for LLM service
- [x] Implement Node.js → Python service communication
- [x] Debug monorepo environment variable loading
- [x] Configure service-specific `.env` files
- [x] Initialize Docker Compose infrastructure
- [x] Add MongoDB container
- [x] Add Redis container
- [x] Add ChromaDB container
- [x] Add n8n container
- [x] Configure Docker named volumes
- [x] Configure container restart policies
- [x] Create API Gateway Dockerfile
- [x] Create LLM Service Dockerfile
- [x] Add API Gateway service to Docker Compose
- [x] Add LLM service to Docker Compose
- [x] Configure internal Docker networking
- [x] Verify containerized service communication
- [x] Test local orchestration using Docker Compose

---

# Verification Notes

Verified working services:

- API Gateway Health Endpoint:
  - `http://localhost:4000/health`

- LLM Service Health Endpoint:
  - `http://localhost:8000/health`

- Node.js → Python Communication:
  - `http://localhost:4000/test-llm`

- n8n Dashboard:
  - `http://localhost:5678`

Verified infrastructure containers:

- MongoDB running on port `27017`
- Redis running on port `6379`
- ChromaDB running on port `8001`
- n8n running on port `5678`

Verified Docker functionality:

- Docker Compose build successful
- Containers successfully networked internally
- Persistent Docker volumes mounted successfully
- Service dependencies resolved correctly

---

# Major Learnings

## Monorepo Environment Variable Resolution

Learned that:

- `dotenv.config()` resolves relative to the running process directory
- `.env` files inside `/src` are not automatically detected
- Service-specific `.env` files are more reliable in monorepo structures

Correct placement:

```txt
apps/api-gateway/.env