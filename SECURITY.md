# SECURITY.md: Production Security Standards

## 1. Core Principle: Zero Trust
- Never trust the client. All data coming from the frontend must be validated and sanitized on the backend.
- Hidden UI elements (like buttons) are for UX only. Security is enforced via backend middleware and database rules.

## 2. Authentication & Authorization (RBAC)
- **JWT Strategy:** Use JSON Web Tokens (JWT). The token payload must only contain `userId` and `role`. Never put sensitive data in the JWT.
- **Password Hashing:** Use `bcryptjs` with a minimum salt round of 10. Never store plaintext passwords.
- **The Roles:** Enum strictly limited to `director`, `intern`, and `client`.
- **Middleware Enforcement:**
  - `protect`: Verifies the JWT and attaches `req.user` to the request. Rejects invalid/expired tokens with a 401.
  - `authorize('director', 'intern')`: Checks `req.user.role`. Rejects unauthorized roles with a 403.
  - **Rule:** Every single route in `/api/` must use `protect`. Role-specific routes must use `authorize`.

## 3. Database Security (MongoDB/Mongoose)
- **NoSQL Injection Prevention:** Use `express-mongo-sanitize` globally. Never pass raw `req.body` or `req.query` directly into Mongoose queries.
- **Data Leakage:** When returning user data, always use `.select('-password -__v')` to prevent accidental exposure of hashed passwords.
- **Validation:** Use `Joi` or Mongoose Schema validation for strict type checking. If a field expects a Number, reject it if it's a String.

## 4. Real-World Data Handling (The "No AI" Zone)
- **Financial Data:** Invoice generation and payment updates must be wrapped in database transactions to prevent partial writes.
- **Audit Logs:** Any route that modifies a `Client`, `Invoice`, or `User` role must log the action (Actor ID, Action, Timestamp, IP Address) to an `AuditLog` collection.
- **Client Data Isolation:** An intern must never be able to query a client's financial data. A client must never be able to query another client's data. Filter queries by `req.user.id` or `req.user.clientId` on the backend.

## 5. Infrastructure & Configuration
- **Environment Variables:** All secrets (MongoDB URI, JWT Secret, Twilio Keys, SMTP credentials) must live in `.env`. Never hardcode them.
- **CORS:** Restrict CORS to only your frontend domain in production (e.g., `https://crm.yourdomain.com`).
- **Rate Limiting:** Apply `express-rate-limit` to the `/api/auth/login` route (max 5 requests per 15 minutes per IP) to prevent brute force attacks.
- **PDF Generation:** PDFs must be generated server-side and streamed back to the client, or stored in a private bucket. Never expose the server file system directly.

## 6. AI Code Generation Guardrails (CRITICAL)
When using AI assistants (Antigravity, Copilot, ChatGPT, etc.) to write or modify code for this project, the following rules are absolute. Violating these rules will result in rejected code.

1. **Do Not "Improve" Adjacent Code:** If the user asks for a change to `Login.jsx`, do not touch `Navbar.jsx`. Do not fix formatting issues in unrelated files. Do not rename variables in files the user did not mention.
2. **Do Not Refactor What Isn't Broken:** If the user asks to "add a button to the dashboard," do not rewrite the entire dashboard component to use a different state management library. Do exactly what is asked.
3. **Every Changed Line Must Trace to the User's Request:** Before AI generates code, it must be able to answer: *"Which line of the user's prompt justifies this specific change?"* If the answer is "none," the AI must not make the change.
4. **Preserve Existing Security:** Never remove or bypass `protect`, `authorize`, `mongoSanitize`, or any middleware unless explicitly instructed. If a change requires modifying the security layer, the AI must pause and ask for human approval.
5. **Minimize the Diff:** The best code change is the smallest possible change that solves the problem. If a change can be made in 3 lines, do not write 30 lines.

## 7. Component Standards
Every component must include:
- Responsive layout (mobile-first, tablet, desktop).
- Elegant spacing (adhere to 8px grid).
- Smooth hover states (200ms-300ms transitions).
- Loading states and error handling.
- Proper semantic HTML and ARIA labels for accessibility.