# Memory.md — Project Memory & Audit State

> **Purpose:** Living record of the Food Del project architecture, verified features, audit history, and operational commands.  
> **Last Audited & Verified:** October 2026

---

## 1. Project Overview

| Property | Value |
|----------|-------|
| **Project Name** | Food Del |
| **Type** | Full-Stack Food Delivery Web Application & Admin Management System |
| **Tutorial Reference** | https://youtu.be/DBMPXJJfQEA |
| **Project Root** | `C:\Users\ACER\Desktop\Food-Del` |
| **Customer Frontend** | `http://localhost:5173` (Vite dev server) |
| **Admin Panel** | `http://localhost:5174` (Vite dev server) |
| **Backend API** | `http://localhost:4000` (Express server) |
| **Database** | `mongodb://localhost:27017/food-del` (MongoDB via Mongoose) |
| **Stack** | React 19 + Vite (Frontend & Admin), Node.js + Express 5 + MongoDB (Backend) |

---

## 2. Fixed Architectural Decisions

- **HTTP Method Compliance:** Permitted methods are `GET`, `POST`, `PATCH`, and `DELETE`. `PUT` is banned. Zero `PUT` routes or `axios.put()` calls exist.
- **Client HTTP Client:** Axios is mandatory across all frontend and admin API communications.
- **Authentication:** Password hashing via `bcrypt` (10 rounds); session tokens via `jsonwebtoken` (JWT); stored in `localStorage`.
- **Role-Based Authorization:** Backend role enforcement via `authMiddleware` (user token check) and `adminMiddleware` (strictly requiring `user.role === 'admin'`).
- **Styling:** Vanilla CSS with component scoping and responsive media/container queries.

---

## 3. Verified Project Structure

```
Food-Del/
├── Architecture.md         # Full system architecture and API documentation
├── Design.md               # UI/UX design specifications (Frontend & Admin)
├── Memory.md               # Project memory and audit status (this document)
├── Phases.md               # Roadmap status for all phases (1–9 completed)
├── PRD.md                  # Product requirements and verification matrix
├── Rules.md                # Development rules and security constraints
├── admin/                  # Restaurant Management Portal (React 19 + Vite)
│   ├── package.json        # axios, react, react-dom, react-router-dom, react-toastify
│   ├── vite.config.js
│   ├── .oxlintrc.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx         # Admin root: token auth gate, layout, page router
│       ├── assets/         # Admin logos, icons, assets.js
│       ├── Navbar/         # Top navigation with avatar, user info, and logout
│       ├── Sidebar/        # Menu links: Dashboard, Add Food, Manage Food, Orders, Users
│       ├── Dashboard/      # Live analytics cards, revenue calculator, order status breakdown
│       ├── Add/            # Dedicated food creation form with image preview
│       ├── List/           # Food catalog table with inline Add, Edit (PATCH), and Delete modals
│       ├── Orders/         # Order cards with status changer (PATCH) and address inspector
│       ├── Users/          # Registered customer list and search
│       └── Login/          # Admin login gate verifying administrator privileges
├── backend/                # REST API Server (Node.js + Express 5)
│   ├── package.json        # scripts: server, seed:food, create:admin, test
│   ├── server.js           # Server configuration, middleware, and route mounting
│   ├── .env                # MONGODB_URI and JWT_SECRET
│   ├── config/db.js        # Mongoose connection handler
│   ├── models/
│   │   ├── userModel.js    # Name, email, hashed password, cartData, role enum
│   │   ├── foodModel.js    # Custom ID, name, description, price, category, image
│   │   └── orderModel.js   # User ID, item sub-schema, amount, address, status, payment
│   ├── middleware/
│   │   └── auth.js         # authMiddleware (JWT) and adminMiddleware (role: 'admin')
│   ├── controllers/
│   │   ├── userController.js  # registerUser, loginUser, listUsers
│   │   ├── foodController.js  # listFood, addFood, updateFood (PATCH), removeFood (DELETE)
│   │   ├── cartController.js  # addToCart, removeFromCart (with removeAll), getCart
│   │   └── orderController.js # placeOrder (COD), userOrders, listOrders, updateOrderStatus, getDashboardStats
│   ├── routes/
│   │   ├── userRoute.js    # /api/user routes
│   │   ├── foodRoute.js    # /api/food routes
│   │   ├── cartRoute.js    # /api/cart routes
│   │   └── orderRoute.js   # /api/order routes
│   ├── scripts/
│   │   ├── seedFood.js     # Seeds 32 food items and copies images to uploads/
│   │   └── createAdmin.js  # CLI utility to provision administrator accounts
│   ├── uploads/            # 32 catalog images + user uploads served at /images/
│   └── test_e2e.mjs        # Automated API test suite covering full lifecycle & auth guards
└── frontend/               # Customer Web Application (React 19 + Vite)
    ├── package.json        # axios, react, react-dom, react-router-dom, lucide-react
    ├── vite.config.js
    └── src/
        ├── main.jsx        # Root with BrowserRouter, ToastProvider, StoreContextProvider
        ├── App.jsx         # App routes: /, /cart, /order, /orders, /myorders
        ├── assets/         # Customer images, icons, and bundled fallbacks
        ├── context/
        │   ├── StoreContext.jsx   # Global cart, catalog sync, token, and API base URL
        │   ├── ToastContext.jsx   # Lightweight global toast notification provider
        │   └── Toast.css          # Toast alert animations and styling
        ├── components/
        │   ├── Navbar/Navbar/     # Navigation bar, cart badge dot, profile dropdown
        │   ├── Navbar/Header/     # Hero banner with smooth scroll
        │   ├── ExploreMenu/       # 8-category interactive filter with "All" reset
        │   ├── FoodDisplay/       # Food grid, card hover lift, counter (+/-)
        │   ├── LoginPopup/        # Modal login & registration form with inline feedback
        │   └── Footer/            # Three-column responsive footer
        └── pages/
            ├── Home/              # Main landing page
            ├── Cart/              # Shopping cart with totals and promo code box
            ├── PlaceOrder/        # Delivery details form, COD confirmation screen
            └── MyOrders/          # Customer order history and order tracking
```

---

## 4. Features Implemented & Audited

| Feature | Verified | Implementation Details |
|---------|----------|------------------------|
| **Browse Food Catalog** | ✅ Yes | `GET /api/food/list` loads 32 dishes dynamically with local asset fallback. |
| **Category Filtering** | ✅ Yes | Interactive category selector in `ExploreMenu.jsx` filtering `FoodDisplay.jsx`. |
| **Cart Operations** | ✅ Yes | Add, decrement, and atomic removal (`removeAll: true`) with optimistic UI and backend sync. |
| **Cart Persistence** | ✅ Yes | User cart stored in MongoDB `user.cartData` and restored automatically on login. |
| **User Registration** | ✅ Yes | `POST /api/user/register` with email validation, bcrypt password hashing, and JWT creation. |
| **User Login** | ✅ Yes | `POST /api/user/login` validating password against hash, issuing 7-day JWT token. |
| **Place Order (COD)** | ✅ Yes | `POST /api/order/place` re-verifies item prices from DB, adds Rs. 50 delivery fee, clears cart. |
| **Order History** | ✅ Yes | `GET /api/order/userorders` rendered in `MyOrders.jsx` with tracking timeline. |
| **Admin Dashboard** | ✅ Yes | `GET /api/order/dashboard` aggregating active food count, users, orders, and revenue. |
| **Admin Food Management** | ✅ Yes | Add food (`POST /api/food/add`), Edit food (`PATCH /api/food/update`), Delete food (`DELETE /api/food/remove`). |
| **Admin Order Management** | ✅ Yes | List orders (`GET /api/order/list`), update status (`PATCH /api/order/status`), customer address viewer. |
| **Admin User Inspection** | ✅ Yes | Customer list (`GET /api/user/list`) with password exclusion and user search. |
| **Admin Role Authorization** | ✅ Yes | `adminMiddleware` strictly checks `user.role === 'admin'`; ordinary users receive `403 Forbidden`. |

---

## 5. Working Commands

### Customer Frontend
```bash
cd frontend
npm install           # Install dependencies
npm run dev           # Start development server at http://localhost:5173
npm run lint          # Run oxlint (0 warnings, 0 errors)
npm run build         # Build production bundle (0 errors)
```

### Admin Management Panel
```bash
cd admin
npm install           # Install dependencies
npm run dev           # Start development server at http://localhost:5174
npm run lint          # Run oxlint (0 warnings, 0 errors)
npm run build         # Build production bundle (0 errors)
```

### Backend API Server
```bash
cd backend
npm install           # Install dependencies
npm run server        # Start server with nodemon at http://localhost:4000
npm run seed:food     # Seed MongoDB with 32 food items and copy images to uploads/
npm run create:admin  # Create or promote an administrator account
npm test              # Run the end-to-end regression test suite
```

---

## 6. Audit & Bug Fix History

| Bug / Finding | Severity | Resolution |
|---------------|----------|------------|
| **Hardcoded Test Email Bypass in `auth.js`** | **Critical Security** | `adminMiddleware` had `user.email === 'e2e_test_user@fooddel.test'` bypass. Removed the bypass so authorization strictly requires `user.role === 'admin'`. Updated `test_e2e.mjs` to test 403 rejection before elevating the test user. |
| **Cart Item Removal Race Condition** | **Medium** | `StoreContext.jsx` sent N parallel `DELETE` requests for multi-unit items. Added `removeAll: true` support to `DELETE /api/cart/remove` and refactored `StoreContext.jsx` to send a single atomic removal request. |
| **Admin Lint Warnings (4 React Compiler warnings)** | **Low** | Oxlint warned about `react(set-state-in-effect)` in `Dashboard.jsx`, `Users.jsx`, `List.jsx`, and `Order.jsx`. Refactored initial state to match mount status and loaded data asynchronously in effects without synchronous setState. Oxlint now reports 0 warnings and 0 errors. |
| **Unused `admin/src/Add/Add.jsx` Component** | **Low** | The dedicated Add Food component was unreferenced in `App.jsx` and `Sidebar.jsx`. Wired `Add.jsx` into the admin router and added `Add Food` to the sidebar navigation. |
| **Missing `/myorders` Route Alias** | **Low** | Added `<Route path='/myorders' element={<MyOrders />} />` to `frontend/src/App.jsx` so both `/orders` and `/myorders` resolve seamlessly. |
| **Backend Scripts in `package.json`** | **Low** | Added `"test": "node test_e2e.mjs"` and `"create:admin": "node scripts/createAdmin.js"` to `backend/package.json`. |

---

## 7. Submission Readiness Checklist

- [x] All application source files inspected across `admin/`, `backend/`, and `frontend/`.
- [x] All 6 Markdown documentation files updated and aligned with actual implementation.
- [x] Zero `PUT` routes or `axios.put()` calls anywhere in the project.
- [x] Passwords securely hashed with bcrypt; plaintext passwords never stored or logged.
- [x] JWT authentication and role-based authorization enforced on backend API.
- [x] Regular users strictly forbidden from admin endpoints (`403 Forbidden`).
- [x] Frontend lint: 0 warnings, 0 errors (`oxlint`).
- [x] Frontend build: 161 modules transformed, builds cleanly with Vite.
- [x] Admin lint: 0 warnings, 0 errors (`oxlint`).
- [x] Admin build: 101 modules transformed, builds cleanly with Vite.
- [x] Cash on Delivery order flow and customer order history fully wired.
- [x] Admin Panel food management, order status update, dashboard, and customer directory fully wired.
- [x] Environment secrets kept out of source code (`.env` in `.gitignore`).
- [x] Database seed script and administrator creation CLI script tested and ready.
