# Rules.md — AI Coding Rules & Architectural Constraints

> These rules apply to **any AI assistant or human developer** maintaining or contributing to this project.  
> Rules 1–3 are **mandatory architectural constraints**, not preferences.

---

## Rule 1 — Approved Technology Stack (MANDATORY)

This technology stack is locked. No substitutions or unapproved dependencies may be introduced.

### Customer Frontend (`frontend/`)

| Technology | Role | Status |
|------------|------|--------|
| React.js (v19) | UI Component Framework | ✅ In use |
| JavaScript (ESM) | Language | ✅ In use |
| Vanilla CSS | Component-scoped Styling | ✅ In use |
| **Axios** | **All HTTP requests to the backend API** | ✅ In use |
| React Router DOM (v7) | Client-side routing | ✅ In use |
| Vite (v8) | Build tool & dev server | ✅ In use |

### Admin Management Panel (`admin/`)

| Technology | Role | Status |
|------------|------|--------|
| React.js (v19) | Admin UI Component Framework | ✅ In use |
| JavaScript (ESM) | Language | ✅ In use |
| Vanilla CSS | Admin Dashboard & Table Styling | ✅ In use |
| **Axios** | **All Admin HTTP requests to backend API** | ✅ In use |
| React Toastify | Admin Action Notifications | ✅ In use |
| Vite (v8) | Build tool & dev server | ✅ In use |

### Backend API (`backend/`)

| Technology | Role | Status |
|------------|------|--------|
| Node.js & Express (v5) | HTTP REST API Server | ✅ In use |
| MongoDB & Mongoose (v9) | Database & Schema Modeling | ✅ In use |
| bcrypt (v6) | Password Hashing | ✅ In use |
| jsonwebtoken (v9) | JWT Authentication Tokens | ✅ In use |
| multer (v2) | Image Upload Multipart Handling | ✅ In use |
| validator | Input & Email Validation | ✅ In use |
| dotenv | Environment Configuration | ✅ In use |

### Prohibited Substitutions
- **Do not use `fetch()` or `XMLHttpRequest`** — always use Axios for API requests.
- **Do not use TailwindCSS or CSS-in-JS libraries** — vanilla CSS is the standard for this codebase.
- **Do not use unhashed plaintext passwords** — all passwords must be hashed using bcrypt.

---

## Rule 2 — HTTP Method Policy: GET, POST, PATCH, DELETE Only (MANDATORY)

All Express routes and all Axios calls must strictly adhere to the permitted HTTP methods:

### Permitted Methods
- `GET` — Fetch data (catalogs, carts, orders, metrics, user lists).
- `POST` — Create records or perform operations (register, login, add food, place order, add to cart).
- `PATCH` — Partially update existing records (update order status, update food details).
- `DELETE` — Remove records (remove food item, remove item from cart).

### Prohibited Methods
- ❌ **`PUT` is strictly prohibited.** Always use `PATCH` for updates.
- ❌ **`OPTIONS` must never be defined as an application route.** CORS preflight is handled by `cors()` middleware.
- ❌ **`HEAD` must never be defined as an application route.**

---

## Rule 3 — Authentication & Role-Based Authorization (MANDATORY)

### Password Security
- All user passwords must be hashed using `bcrypt.hash()` with at least 10 salt rounds before being stored.
- Passwords must never be logged, printed, or returned in API responses (`select('-password')`).

### Token Security
- All authentication tokens must be signed with `jwt.sign()` using `process.env.JWT_SECRET`.
- Secrets must never be hardcoded or committed to version control.
- Tokens are transmitted via the HTTP `Authorization: Bearer <token>` header.

### Backend Authorization Enforcement
- **Never rely exclusively on UI hiding for security.**
- All user-specific operations (cart, checkout, order history) must be protected by `authMiddleware`.
- All administrative operations (food additions, food edits, food deletions, status updates, order listings, user listings, dashboard metrics) must be protected on the backend by `adminMiddleware`.
- `adminMiddleware` must strictly verify that the authenticated user has `role === 'admin'`. Never insert hardcoded email bypasses into production middleware.
- Unauthorized requests must return `401 Unauthorized` (missing/invalid token) or `403 Forbidden` (insufficient privileges).

---

## Rule 4 — Read Before You Write

- Inspect existing files and components before proposing or making changes.
- Check if a utility, route, model field, or CSS class already exists before creating a new one.
- Verify how components and context communicate.

---

## Rule 5 — Preserve What Works

- Maintain existing working functionality, responsive layouts, and UI design.
- Make minimal, targeted changes to address genuine issues.
- Do not rebuild components from scratch or alter working architectures without explicit instruction.

---

## Rule 6 — Atomic Code Changes and Minimal Diff Scope

- Change only the lines that genuinely need correction.
- Do not reformat unrelated files or reorder existing code unnecessarily.
- Preserve existing comments and docstrings.

---

## Rule 7 — Input Validation and Error Handling

- Validate all client payloads on the backend before processing.
- Verify required address fields, valid quantities, non-negative prices, and allowed category enums.
- Always handle asynchronous rejections gracefully using `try/catch` and return standard error JSON envelopes: `{ success: false, message: '...' }`.

---

## Rule 8 — Separation of Concerns

- **`frontend/`**: Customer web interface, context providers, and responsive client pages.
- **`admin/`**: Restaurant management panel, metrics dashboard, and catalog/order editors.
- **`backend/`**: Express server, Mongoose models, controllers, upload directories, and seed scripts.
- Code must not leak across these directory boundaries; communication occurs strictly over REST APIs via Axios.
