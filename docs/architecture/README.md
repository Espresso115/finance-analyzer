# Architecture Notes

## Service Boundaries

- React frontend owns user interface, routing, forms, charts, and client-side state.
- Node.js API gateway is the only public backend surface for browser clients.
- API gateway owns authentication, authorization, sessions, rate limiting, uploads, WebSockets, and routing to internal services.
- Python services own parsing, RAG, embeddings, LLM inference, NLP, and long-running AI work.
- Worker service owns async jobs, retries, scheduled indexing, notification fanout, and queue consumers.
- n8n owns external automation workflows and calls stable internal APIs/webhooks. It should not contain core business logic.

## Data Stores

- MongoDB: users, refresh tokens, sessions, audit logs, document metadata, chats, analysis history, workflows, settings, notifications.
- Redis: cache, rate limits, token invalidation, BullMQ queues, AI response cache, streaming state.
- ChromaDB: document embeddings and metadata-filterable semantic search.
- File/object storage: uploaded source documents and generated reports.

## Initial Model Direction

- Start with Qwen2.5-7B-Instruct through Ollama for local development.
- Keep the LLM service provider interface clean so vLLM, llama.cpp, or hosted inference can be added later.

## Day 1 Rule

Do not build AI features before the gateway, auth, storage, and health-check foundation are stable.
