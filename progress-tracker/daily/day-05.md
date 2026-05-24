# Day 5 – 2026-05-21

Date: 2026-05-21
Status: Completed

---

# Goal

Add user profile management endpoints and market data retrieval with Redis caching.

---

# Checklist

- [x] Added User Profile routes (`GET /api/v1/users/profile`, `PUT /api/v1/users/profile`).
- [x] Implemented profile controller (`getProfile`, `updateProfile`).
- [x] Added profile validation (allowed fields: `bio`, `avatarUrl`).
- [x] Created `user.routes.js` and mounted under `/api/v1/users` in `index.js`.
- [x] Added Market Data route (`GET /api/v1/market/quote/:symbol`).
- [x] Implemented `market.service.js` with external API call and Redis caching (TTL 60 s).
- [x] Created `market.controller.js` and `market.routes.js`; mounted under `/api/v1/market`.
- [x] Added Redis client (`src/config/redis.js`).
- [x] Updated `.env` with `REDIS_URL` (already present) and added `JWT_SECRET`/`JWT_EXPIRES_IN`.
- [x] Updated `apps/api-gateway/src/index.js` to import and use new routes.
- [x] Updated `package.json` dependencies (`ioredis`, `node-fetch`).
- [x] Updated `CHANGELOG.md` and `CURRENT_STATE.md` to reflect Day 5 progress.
- [x] Ran full Jest suite – all 7 tests pass, including JWT‑expired edge case.
- [x] Verified manual requests to new endpoints (profile & market) work and Redis cache hits on second market call.

---

# Verification Notes

- Profile endpoints correctly require JWT via `protect` middleware and return only permitted fields.
- Market endpoint returns JSON `{ symbol, price, timestamp }`; second request within 60 s logs “Cache hit” and returns cached data.
- All Jest tests pass (`npm test` shows 7 passed).
- Manual `curl` calls confirmed correct behavior.
