# Architecture.md — Application Architecture

> **Status:** Verified — Based on full codebase audit (October 2026).  
> Covers Customer Frontend, Admin Panel, Backend REST API, and MongoDB Database.

---

## 1. Mandatory Technology Stack

These technologies are fixed for this project. No substitutions are permitted.

### Customer Frontend (`frontend/`)

| Technology | Version (package.json) | Role | Status |
|------------|------------------------|------|--------|
| React.js | ^19.2.8 | Single-page application UI framework | ✅ In use |
| JavaScript | ES Modules | Programming language | ✅ In use |
| HTML5 | — | Structural markup (via JSX) | ✅ In use |
| CSS3 | — | Vanilla CSS (component-scoped + responsive design) | ✅ In use |
| **Axios** | ^1.21.0 | **HTTP client for all backend REST requests** | ✅ In use |
| React Router DOM | ^7.18.4 | Client-side routing (`/`, `/cart`, `/order`, `/orders`, `/myorders`) | ✅ In use |
| Vite | ^8.3.0 | Build tool and dev server (`http://localhost:5173`) | ✅ In use |
| Lucide React | ^1.61.0 | Icon library | ✅ Installed |
| Outfit (Google Font) | Variable (100–900) | Typography loaded via `@import` in `index.css` | ✅ In use |

### Admin Panel (`admin/`)

| Technology | Version (package.json) | Role | Status |
|------------|------------------------|------|--------|
| React.js | ^19.3.1 | Admin single-page application framework | ✅ In use |
| JavaScript | ES Modules | Programming language | ✅ In use |
| CSS3 | — | Responsive admin styling (Dashboard, Food, Orders, Users) | ✅ In use |
| **Axios** | ^1.21.0 | **HTTP client for all admin backend API calls** | ✅ In use |
| React Toastify | ^11.2.0 | Feedback toasts for admin actions | ✅ In use |
| Vite | ^8.3.5 | Build tool and dev server (`http://localhost:5174`) | ✅ In use |

### Backend API (`backend/`)

| Technology | Version (package.json) | Role | Status |
|------------|------------------------|------|--------|
| Node.js | Runtime | Server execution environment | ✅ In use |
| Express.js | ^5.3.0 | REST API server and routing | ✅ In use |
| MongoDB | v6+ / Atlas | NoSQL document database | ✅ In use |
| Mongoose | ^9.11.4 | Document schemas, validation, and database queries | ✅ In use |
| dotenv | ^18.0.9 | Environment variable management (`.env`) | ✅ In use |
| cors | ^2.8.6 | Cross-origin resource sharing middleware | ✅ In use |
| bcrypt | ^6.0.0 | Salt generation and password hashing | ✅ In use |
| jsonwebtoken | ^9.0.3 | JWT signing and bearer token verification | ✅ In use |
| validator | ^13.15.35 | Email syntax validation | ✅ In use |
| multer | ^2.5.0 | Multipart/form-data food image upload handling | ✅ In use |
| stripe | ^23.0.1 | Payment processing dependency (installed) | ✅ Installed |
| body-parser | ^2.4.0 | JSON body parsing | ✅ In use |
| nodemon | ^3.1.14 | Development auto-restart | ✅ In use |

---

## 2. API HTTP Method Policy — CRITICAL

All Express route definitions and all Axios requests adhere strictly to this policy:

### Permitted Methods

| Method | Application Usage |
|--------|-------------------|
| `GET` | Retrieve food catalog, user cart, user orders, admin order list, customer list, dashboard metrics, and health check. |
| `POST` | User registration, user login, add food (admin), place order (Cash on Delivery), add item to cart. |
| `PATCH` | Update order status (admin), update food item details/image (admin). |
| `DELETE` | Remove food item and delete image file (admin), remove item/quantity from user cart. |

### Prohibited Methods

| Method | Status | Reason |
|--------|--------|--------|
| `PUT` | ❌ **Banned** | Use `PATCH` for all partial or full updates. Zero `PUT` routes or `axios.put()` calls exist in the project. |
| `OPTIONS` | ❌ **No app route** | Handled transparently by `cors()` middleware. |
| `HEAD` | ❌ **No app route** | Not required for this application. |

---

## 3. System Architecture Diagram

```
       ┌───────────────────────────────┐           ┌───────────────────────────────┐
       │   Customer Frontend (React)   │           │      Admin Panel (React)      │
       │     http://localhost:5173     │           │     http://localhost:5174     │
       └──────────────┬────────────────┘           └──────────────┬────────────────┘
                      │                                           │
                      │ Axios (GET, POST, PATCH, DELETE)          │ Axios + Bearer JWT
                      │ Headers: Authorization: Bearer <token>    │ Role: admin only
                      │                                           │
                      └─────────────────────┬─────────────────────┘
                                            ▼
                       ┌─────────────────────────────────────────┐
                       │      Backend REST API (Express.js)      │
                       │          http://localhost:4000          │
                       ├─────────────────────────────────────────┤
                       │  Middleware:                            │
                       │    ├── cors()                           │
                       │    ├── express.json()                   │
                       │    ├── express.static('/images')        │
                       │    ├── authMiddleware (JWT verify)      │
                       │    └── adminMiddleware (role: 'admin')  │
                       ├─────────────────────────────────────────┤
                       │  Routers:                               │
                       │    ├── /api/user   (register, login,    │
                       │    │                admin listUsers)    │
                       │    ├── /api/food   (list, add, update,  │
                       │    │                remove)             │
                       │    ├── /api/cart   (add, remove, get)   │
                       │    └── /api/order  (place, userorders,  │
                       │                     dashboard, list,    │
                       │                     status)             │
                       └────────────────────┬────────────────────┘
                                            │ Mongoose ODM
                                            ▼
                       ┌─────────────────────────────────────────┐
                       │          MongoDB Database               │
                       │        localhost:27017/food-del         │
                       ├─────────────────────────────────────────┤
                       │  Collections:                           │
                       │    ├── users   (credentials & cart)     │
                       │    ├── foods   (catalog & images)       │
                       │    └── orders  (COD orders & statuses)  │
                       └─────────────────────────────────────────┘
```

---

## 4. Authentication and Authorization Flow

```
1. Customer / Admin submits login credentials via Axios:
   POST /api/user/login  { email, password }

2. Backend userController:
   - Finds account in MongoDB by lowercase email
   - Compares plaintext password against bcrypt hash: bcrypt.compare()
   - Generates JWT signed with process.env.JWT_SECRET (expires: 7 days)
   - Returns { success: true, token, user: { id, name, email, role } }

3. Frontend:
   - Stores JWT in localStorage ('token')
   - Includes token in Axios requests: headers: { Authorization: `Bearer ${token}` }

4. Backend Middleware Guard:
   - authMiddleware:
     * Extracts Bearer token
     * jwt.verify(token, process.env.JWT_SECRET)
     * Injects req.userId = decoded.id
     * Returns 401 if missing, invalid, or expired
   - adminMiddleware:
     * Executes authMiddleware checks
     * Loads user document from database by decoded.id
     * Strictly verifies user.role === 'admin'
     * Returns 403 Forbidden if user.role !== 'admin'
```

---

## 5. Endpoints Reference

### User Routes (`/api/user`)

| Method | Endpoint | Protection | Description |
|--------|----------|------------|-------------|
| `POST` | `/api/user/register` | Public | Register new account (hashes password, returns JWT) |
| `POST` | `/api/user/login` | Public | Authenticate existing user, returns JWT and user profile |
| `GET` | `/api/user/list` | Admin only | Returns registered customer accounts (safe fields only) |

### Food Routes (`/api/food`)

| Method | Endpoint | Protection | Description |
|--------|----------|------------|-------------|
| `GET` | `/api/food/list` | Public | Retrieve entire active food catalog |
| `POST` | `/api/food/add` | Admin only | Upload image via multer and create food item |
| `PATCH` | `/api/food/update` | Admin only | Partially update name, description, category, price, or image |
| `DELETE` | `/api/food/remove` | Admin only | Delete food item and remove image file from disk |

### Cart Routes (`/api/cart`)

| Method | Endpoint | Protection | Description |
|--------|----------|------------|-------------|
| `POST` | `/api/cart/add` | Authenticated | Increment quantity of item in user cart |
| `DELETE` | `/api/cart/remove` | Authenticated | Decrement quantity or remove item completely (`removeAll: true`) |
| `GET` | `/api/cart/get` | Authenticated | Retrieve user cart map `{ [itemId]: quantity }` |

### Order Routes (`/api/order`)

| Method | Endpoint | Protection | Description |
|--------|----------|------------|-------------|
| `POST` | `/api/order/place` | Authenticated | Place order (re-computes item prices from DB + Rs. 50 delivery fee) |
| `GET` | `/api/order/userorders` | Authenticated | Retrieve order history for logged-in user |
| `GET` | `/api/order/dashboard` | Admin only | Aggregates real-time counts, revenue, and recent orders |
| `GET` | `/api/order/list` | Admin only | Retrieve all orders across all customers |
| `PATCH` | `/api/order/status` | Admin only | Update status (`Food Processing`, `Out for Delivery`, `Delivered`, `Cancelled`) |

---

## 6. Project Directory Structure

```
Food-Del/
├── Architecture.md         # Architecture documentation (this file)
├── Design.md               # UI/UX design specifications
├── Memory.md               # Living project log and audit state
├── Phases.md               # Implementation roadmap and status
├── PRD.md                  # Product requirements document
├── Rules.md                # AI coding rules and security guidelines
├── admin/                  # Administrator Panel (React + Vite)
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx         # Authentication gate and page router
│       ├── assets/         # Admin images and assets.js
│       ├── Navbar/         # Admin header and logout
│       ├── Sidebar/        # Admin menu navigation
│       ├── Dashboard/      # Store metrics and recent orders
│       ├── Add/            # Dedicated Add Food form
│       ├── List/           # Food catalog management with modal Add/Edit/Delete
│       ├── Orders/         # Order status updates and address viewer
│       ├── Users/          # Registered customer directory
│       └── Login/          # Admin sign-in portal
├── backend/                # Node.js + Express API
│   ├── server.js           # Server entry point
│   ├── package.json
│   ├── .env                # MONGODB_URI and JWT_SECRET
│   ├── config/db.js        # Mongoose database connection
│   ├── models/             # userModel, foodModel, orderModel
│   ├── controllers/        # userController, foodController, cartController, orderController
│   ├── middleware/auth.js  # authMiddleware and adminMiddleware
│   ├── routes/             # userRoute, foodRoute, cartRoute, orderRoute
│   ├── scripts/            # seedFood.js, createAdmin.js
│   ├── uploads/            # Uploaded and seeded food images
│   └── test_e2e.mjs        # End-to-end API regression test suite
└── frontend/               # Customer Web Application (React + Vite)
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx        # Wraps with BrowserRouter, ToastProvider, StoreContextProvider
        ├── App.jsx         # App router with header, routes, and footer
        ├── assets/         # Customer images, icons, and static fallbacks
        ├── context/        # StoreContext (cart, auth, catalog) and ToastContext
        ├── components/     # Navbar, Header, ExploreMenu, FoodDisplay, LoginPopup, Footer
        └── pages/          # Home, Cart, PlaceOrder, MyOrders
```
