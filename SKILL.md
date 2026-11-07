# SKILL.md: Technical Stack & Architectural Standards

## 1. Project Context
This is a production-grade, multi-tenant CRM platform. The code must be scalable, maintainable, and secure. We are using a **MERN Stack** (MongoDB, Express, React, Node.js).

## 2. Backend Standards (Node.js/Express)
- **Language:** JavaScript (ES6+), use `import/export` syntax if configured, otherwise `require`.
- **Architecture:** MVC (Model-View-Controller) pattern.
  - Routes define the URL and apply middleware.
  - Controllers contain the business logic and return JSON responses.
  - Models define the Mongoose schema and handle DB interactions.
- **Error Handling:** Every controller must be wrapped in a `try/catch` block. Use a global error-handling middleware to catch unhandled promise rejections and return standardized JSON errors (e.g., `{ success: false, message: "Error" }`).
- **Libraries:** 
  - Auth: `jsonwebtoken`, `bcryptjs`
  - DB: `mongoose`
  - Email: `nodemailer`
  - WhatsApp: `twilio`
  - PDF: `pdfkit`
  - Scheduler: `node-cron`
  - Security: `express-mongo-sanitize`, `express-rate-limit`, `cors`

## 3. Frontend Standards (React + Vite + Tailwind v4)
- **Framework:** React (Vite). No Next.js, no Create React App.
- **Styling:** Tailwind CSS **v4**. 
  - Do **not** use `tailwind.config.js`. 
  - Define theme colors using the `@theme` directive in `src/index.css`.
  - Use utility classes. Do not write custom CSS files unless absolutely necessary.
- **State Management:** 
  - Global state: React Context API (for Auth/Roles).
  - Local state: `useState`, `useReducer`.
- **Routing:** `react-router-dom` v6+. Use `<Outlet />` and nested routes for layouts. Use `ProtectedRoute` for role-based access.
- **API Calls:** `axios`. Use an interceptor to attach the JWT to the `Authorization` header on every request.
- **UI Components:** Use `lucide-react` for icons. Use `@hello-pangea/dnd` for the Kanban board. 

## 4. Database Standards (MongoDB)
- **ODM:** Mongoose.
- **Relationships:** Use `ObjectId` with `ref`. Use `.populate()` to fetch related data (e.g., populating a Task with the assigned Intern's name).
- **Timestamps:** Every schema must have `{ timestamps: true }` enabled.
- **Naming:** Collections must be plural (e.g., `users`, `clients`, `invoices`). Fields must be camelCase.

## 5. AI Code Generation Guardrails (CRITICAL)
When acting as an AI assistant for this project, the following rules are absolute. Violating these rules will result in rejected code.

1. **Do Not "Improve" Adjacent Code:** If the user asks for a change to `Login.jsx`, do not touch `Navbar.jsx`. Do not fix formatting issues in unrelated files. Do not rename variables in files the user did not mention.
2. **Do Not Refactor What Isn't Broken:** If the user asks to "add a button to the dashboard," do not rewrite the entire dashboard component to use a different state management library. Do exactly what is asked.
3. **Every Changed Line Must Trace to the User's Request:** Before generating code, verify: *"Which line of the user's prompt justifies this specific change?"* If the answer is "none," do not make the change.
4. **Preserve Existing Security:** Never remove or bypass `protect`, `authorize`, `mongoSanitize`, or any middleware unless explicitly instructed. If a change requires modifying the security layer, pause and ask for human approval.
5. **Minimize the Diff:** The best code change is the smallest possible change that solves the problem. If a change can be made in 3 lines, do not write 30 lines.

## 6. AI Prompting Rules for Antigravity
When generating code for this project, the AI must adhere to the following:
1. **Never guess schema fields:** Always refer to the Data Model provided in the project documentation.
2. **Write modular code:** Do not put everything in `server.js`. Separate routers, controllers, and models into their respective folders (`/routes`, `/controllers`, `/models`).
3. **No dummy data in production endpoints:** Use `req.body` and validate it. Do not hardcode responses.
4. **Security First:** If asked to create a route that modifies data, automatically include the `protect` and `authorize` middleware in the route definition.
5. **Real-time:** Use Socket.io for the Messaging Hub. If Socket.io fails, implement a polling fallback using `setInterval` in React.
6. **Tailwind v4:** Always use Tailwind v4 syntax (`@import "tailwindcss";` and `@theme`). Never use `@tailwind base;` or `tailwind.config.js`.