# PRD.md — Product Requirements Document

> **Status:** Completed & Verified — Based on full codebase audit (October 2026).  
> All core product features are implemented in `admin/`, `backend/`, and `frontend/`.

---

## 1. Product Overview

**Food Del** is a production-ready, full-stack food delivery application consisting of:
- **Customer Frontend:** A React single-page application allowing users to explore restaurant dishes, filter by category, manage a shopping cart, register/log in, place Cash on Delivery orders, and view past orders.
- **Admin Panel:** A dedicated management portal for restaurant administrators to monitor revenue and order metrics, add/edit/delete dishes with image uploads, update order statuses, and inspect registered customers.
- **Backend REST API:** An Express.js server providing authenticated endpoints using JWT, password security with bcrypt, file uploads with multer, and MongoDB persistence with Mongoose.
- **Database:** MongoDB storing user accounts, food catalog items, and order documents.

---

## 2. Target Users

| User Type | Responsibilities & Capabilities |
|-----------|---------------------------------|
| **Customer** | Browses dishes, adds/removes items from cart, signs in or creates an account, places Cash on Delivery orders with full delivery details, views order tracking history. |
| **Administrator** | Securely logs in through the Admin Portal, views store metrics, adds/edits/deletes food dishes, updates order fulfillment statuses, reviews customer accounts. |

---

## 3. Mandatory Technology Stack

| Component | Technologies |
|-----------|--------------|
| **Frontend** | React 19, JavaScript (ESM), HTML5, CSS3, Axios, React Router DOM, Vite |
| **Admin** | React 19, JavaScript (ESM), CSS3, Axios, React Toastify, Vite |
| **Backend** | Node.js, Express 5, MongoDB, Mongoose 9, bcrypt, jsonwebtoken, multer, validator, cors, dotenv |

---

## 4. Requirements and Verification Matrix

### 4.1 Functional Requirements

| ID | Requirement | Status | Verification Detail |
|----|-------------|--------|---------------------|
| FR-01 | Display food items categorized with images and prices. | ✅ Done | `frontend/src/components/FoodDisplay/` & `ExploreMenu/` connected to `GET /api/food/list`. |
| FR-02 | Category filter with toggle behavior and "All" fallback. | ✅ Done | Tested in `ExploreMenu.jsx` (8 food categories). |
| FR-03 | Add to cart, adjust quantities (+/-), and calculate totals. | ✅ Done | `StoreContext.jsx` manages optimistic state and syncs with backend. |
| FR-04 | Calculate subtotal, delivery fee (Rs. 50), and grand total. | ✅ Done | Computed in Cart, PlaceOrder, and validated on backend. |
| FR-05 | Full cart item removal. | ✅ Done | Cart `×` button triggers atomic item removal via `DELETE /api/cart/remove`. |
| FR-06 | Friendly empty-cart screens. | ✅ Done | Handled gracefully in `Cart.jsx` and `PlaceOrder.jsx`. |
| FR-07 | Delivery address collection for order placement. | ✅ Done | 9 required fields validated on frontend and backend (`firstName`, `lastName`, `email`, `street`, `city`, `province`, `postalCode`, `country`, `phone`). |
| FR-08 | Cash on Delivery (COD) order placement. | ✅ Done | `POST /api/order/place` stores order, re-fetches prices from DB, and clears cart. |
| FR-09 | User registration with hashed password. | ✅ Done | `POST /api/user/register` validates email and hashes password with bcrypt. |
| FR-10 | User login issuing JWT token. | ✅ Done | `POST /api/user/login` returns JWT token stored in `localStorage`. |
| FR-11 | Protected customer operations. | ✅ Done | Cart and order routes protected by `authMiddleware`. |
| FR-12 | Admin food creation with image upload. | ✅ Done | `POST /api/food/add` accepts multipart/form-data via multer, protected by `adminMiddleware`. |
| FR-13 | Admin food deletion and image cleanup. | ✅ Done | `DELETE /api/food/remove` removes document and deletes disk file from `uploads/`. |
| FR-14 | Admin food updates. | ✅ Done | `PATCH /api/food/update` updates fields and cleans up replaced images. |
| FR-15 | Admin order management. | ✅ Done | `GET /api/order/list` and `PATCH /api/order/status` manage lifecycle statuses. |
| FR-16 | Admin dashboard and analytics. | ✅ Done | `GET /api/order/dashboard` computes active dishes, users, orders, and revenue. |
| FR-17 | Customer order history. | ✅ Done | `GET /api/order/userorders` renders order cards in `MyOrders.jsx`. |

### 4.2 Non-Functional Requirements

| ID | Requirement | Status | Verification Detail |
|----|-------------|--------|---------------------|
| NFR-01 | Responsive layout across mobile and desktop. | ✅ Done | Breakpoints at 1050px, 900px, 750px, 700px, 480px, and container queries. |
| NFR-02 | Passwords securely hashed with bcrypt. | ✅ Done | Passwords never stored in plaintext (`userController.js`). |
| NFR-03 | Strict JWT authentication and admin authorization. | ✅ Done | Backend verifies tokens and ensures `role === 'admin'` on admin operations. |
| NFR-04 | Environment secrets kept out of version control. | ✅ Done | `.env` tracked in `.gitignore`, loaded via `dotenv`. |
| NFR-05 | Standard HTTP API methods restricted to GET, POST, PATCH, DELETE. | ✅ Done | No PUT routes exist anywhere in the application. |
| NFR-06 | All frontend/admin API calls use Axios. | ✅ Done | No native `fetch()` calls used in frontend or admin apps. |

---

## 5. Scope Boundaries

### In Scope & Fully Implemented
- Full food catalog browsing and category filtering.
- Persistent user cart (stored in MongoDB for logged-in users, responsive local state for guests).
- User authentication and role-based access control (`user` vs `admin`).
- Cash on Delivery order checkout with order confirmation and customer order history.
- Full Admin Panel with metrics dashboard, dish CRUD, order management, and customer inspection.

### Out of Scope (Educational Project Scope)
- Direct credit card processing via Stripe (stripe package installed as starter dependency).
- Real-time driver GPS tracking.
- SMS or push notifications.
- Cloud / DevOps infrastructure (Docker, Kubernetes).
