# Rules for AI Agents

## CRITICAL DIRECTIVES
1. **DO NOT Rewrite Working Code:** If existing code functions correctly, leave it untouched. Do not refactor purely for stylistic preferences.
2. **DO NOT Restructure Folders:** The monorepo structure (`apps/`, `packages/`) is deliberate. Do not move things around unnecessarily.
3. **DO NOT Modify Critical Infrastructure:** Leave `docker-compose.yml`, package manager configurations, and network setups alone unless explicitly requested and absolutely necessary.
4. **Preserve Docker Compatibility:** Any new service, script, or dependency must work within the established Docker Compose environment.
5. **Maintain Separation of Concerns:**
   - **Node.js:** API routes, auth, websockets, orchestration.
   - **Python:** AI pipelines, RAG, NLP, embeddings, inference.
6. **Keep Edits Minimal and Modular:** Small, atomic changes are strongly preferred over massive PRs.
7. **Read Before Writing:** Always validate current implementation state, dependencies, and communication architecture before making modifications.

## Coding Standards
- Prioritize modular architecture and simplicity over premature abstraction.
- Use `async/await` patterns appropriately in both Node and Python.
- Follow existing formatting (e.g., Prettier/ESLint configs for TS/JS).
- Document new endpoints and complex logic clearly.

STABILITY > CLEANNESS
CONSISTENCY > REWRITES
MODULARITY > COMPLEXITY
