# Day 4 - Authentication System

Date: 2026-05-20
Status: Completed

---

# Goal

Establish a secure, foundational authentication system within the API Gateway, including user registration, login, and robust token generation.

---

# Checklist

- [x] Configure `JWT_SECRET` and `JWT_EXPIRES_IN` in `.env`.
- [x] Create helper functions for password hashing and JWT generation (`utils/auth.js`).
- [x] Create Controller for Register and Login logic (`controllers/auth.controller.js`).
- [x] Set up Express Router mapping (`routes/auth.routes.js`).
- [x] Create JWT verification Middleware (`middleware/auth.middleware.js`).
- [x] Mount the authentication endpoints at `/api/v1/auth`.

---

# Verification Notes

- `/api/v1/auth/register` successfully checks for existing emails/usernames, hashes passwords via `bcryptjs`, and saves to MongoDB.
- `/api/v1/auth/login` successfully compares hashed passwords and issues standard Access Tokens via `jsonwebtoken`.
- `protect` middleware correctly parses `Bearer` tokens from the `Authorization` header and fetches user details from MongoDB for secure routes.
