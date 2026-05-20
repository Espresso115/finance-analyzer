# Start Here

Welcome to the Financial AI Analyzer Platform.
This directory (`/project-context/`) serves as the persistent memory system for AI agents working on this project. 

## Project Overview
The Financial AI Analyzer is a production-grade, full-stack financial intelligence platform built using a hybrid architecture. It combines real-time financial market data with AI-powered analysis using Retrieval-Augmented Generation (RAG).

## Core Architecture
- **Frontend**: React + TypeScript + Vite + TailwindCSS (in `apps/frontend`)
- **API Gateway**: Node.js + Express.js (in `apps/api-gateway`)
- **AI Services**: Python + FastAPI (in `apps/llm-service`, `apps/rag-service`, `apps/parser-service`, `apps/worker-service`)
- **Infrastructure**: Docker Compose orchestrating MongoDB, Redis, ChromaDB, and n8n workflows.
- **Monorepo**: pnpm workspace + Turborepo.

## Rules for Future Agents
1. **Read `AGENT_RULES.md` First:** Strict guidelines against rewrites and architectural deviations.
2. **Read `CURRENT_STATE.md`:** Understand where the project is at before attempting changes.
3. **Check `ARCHITECTURE.md`:** Ensure changes align with the established hybrid architecture.
4. **Update Context:** Update `CHANGELOG.md`, `CURRENT_STATE.md`, and `TASKS.md` when completing significant work.
