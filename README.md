# Food Delivery System

A full-stack food delivery web application built using the **MERN stack (MongoDB, Express.js, React.js, and Node.js)**. The system allows customers to explore food items, manage their shopping carts, place orders using Cash on Delivery (COD), and track order status. It also provides a dedicated administration panel for managing food items, customers, orders, and business statistics.

This project was developed as a MERN stack assignment to demonstrate full-stack development, REST API design, database integration, authentication, authorization, and responsive user interface development.

## 1. Project Overview

The Food Delivery System follows a client-server architecture with three main components:

- **Customer Application:** A web interface for browsing food, managing carts, and placing orders.
- **Admin Dashboard:** A management interface for food catalog operations, customer management, order processing, and dashboard analytics.
- **Backend API:** A RESTful API responsible for authentication, database operations, business logic, order processing, and access control.

MongoDB stores the application data, Express.js and Node.js handle server-side operations, and React.js provides the user interfaces.

## 2. Project Objectives

- Develop a complete full-stack web application using the MERN stack.
- Implement secure user authentication and role-based authorization.
- Design REST API endpoints for food, cart, user, and order management.
- Integrate MongoDB for persistent data storage.
- Build separate customer and administrator interfaces.
- Implement food image uploads and server-side order price validation.
- Apply modular coding practices and document the application for future maintenance.

## 3. Functional Features

### 3.1 Customer Module

- User registration and login.
- Browse food items with images, descriptions, prices, and categories.
- Explore food through interactive category filters.
- Add food items to the cart and adjust quantities.
- Maintain cart data through the backend.
- Place orders using Cash on Delivery.
- View previous orders and monitor order status.
- Receive feedback through in-app notifications.

### 3.2 Administrator Module

- Secure administrator login.
- Dashboard displaying order statistics and revenue information.
- Add food items with image uploads.
- View, search, and filter food catalog entries.
- Edit food item details and delete items.
- View customer information.
- View and manage all orders.
- Update order status.
- Access protected management operations through server-side role checks.

### 3.3 Backend and Security

- RESTful API architecture.
- Password hashing using bcrypt.
- JWT-based authentication.
- Role-based access control for administrative endpoints.
- Server-side food price verification during checkout.
- Image upload restrictions for supported image types and file sizes.
- Persistent storage of user, food, cart, and order data.

## 4. System Architecture

```text
                 FOOD DELIVERY SYSTEM
                          |
             +------------+------------+
             |                         |
       Customer Frontend          Admin Panel
        React + Vite              React + Vite
             |                         |
             +------------+------------+
                          |
                     REST API
                 Express.js + Node.js
                          |
             +------------+------------+
             |            |            |
          MongoDB       JWT Auth    Multer Uploads
             |
      Users, Food, Orders
```

The frontend applications communicate with the backend through HTTP requests. The backend validates requests, applies authentication and authorization rules, processes business logic, and interacts with MongoDB.

## 5. Technology Stack

| Component | Technologies |
|---|---|
| Frontend | React.js, Vite, JavaScript, CSS |
| Admin Interface | React.js, Vite, JavaScript, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JSON Web Token (JWT) |
| Password Security | bcrypt |
| API Requests | Axios |
| Image Uploads | Multer |
| Notifications | React Context-based toast system |
| Code Quality | Oxlint |
| Version Control | Git and GitHub |

## 6. Project Directory Structure

```text
Food-Del/
├── admin/
│   └── src/
│       ├── Add/
│       ├── Dashboard/
│       ├── List/
│       ├── Login/
│       ├── Navbar/
│       ├── Orders/
│       ├── Sidebar/
│       ├── Users/
│       ├── App.jsx
│       └── main.jsx
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── cartController.js
│   │   ├── foodController.js
│   │   ├── orderController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── userModel.js
│   │   ├── foodModel.js
│   │   └── orderModel.js
│   ├── routes/
│   ├── scripts/
│   ├── uploads/
│   ├── server.js
│   ├── package.json
│   └── test_e2e.mjs
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       ├── App.jsx
│       └── main.jsx
│
├── Architecture.md
├── Design.md
├── Memory.md
├── Phases.md
├── PRD.md
├── Rules.md
└── README.md
```

## 7. Database Design

The application uses MongoDB with Mongoose schemas.

| Collection / Model | Purpose |
|---|---|
| User | Stores customer and administrator account information, password hashes, roles, and cart data. |
| Food | Stores food item names, descriptions, prices, categories, and image references. |
| Order | Stores customer references, ordered items, delivery address, amount, payment method, and order status. |

The database models support the core operations of the customer application and administrator dashboard.

## 8. API Design

The backend exposes REST API endpoints organized by resource. Protected endpoints require a valid JWT, while administrator-only endpoints additionally require administrator privileges.

### User endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/user/register` | Register a user |
| POST | `/api/user/login` | Authenticate a user |
| GET | `/api/user/list` | Retrieve users (admin only) |

### Food endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/food/list` | Retrieve food items |
| POST | `/api/food/add` | Add food (admin only) |
| PATCH | `/api/food/update` | Update food (admin only) |
| DELETE | `/api/food/remove` | Delete food (admin only) |

### Cart endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/cart/add` | Add food to the cart |
| DELETE | `/api/cart/remove` | Remove food from the cart |
| POST | `/api/cart/get` | Retrieve cart contents |

### Order endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/order/place` | Place an order |
| POST | `/api/order/userorders` | Retrieve a customer's orders |
| GET | `/api/order/list` | Retrieve all orders (admin only) |
| PATCH | `/api/order/status` | Update order status (admin only) |
| GET | `/api/order/dashboard` | Retrieve dashboard statistics (admin only) |

**Note:** Confirm the endpoint paths and methods against the actual backend route files before submission.

## 9. Installation and Execution

### Prerequisites

- Node.js and npm.
- MongoDB installed locally or a valid MongoDB connection URI.
- Git.

### Step 1: Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Food-Del
```

### Step 2: Configure and start the backend

```bash
cd backend
npm install
```

Create `backend/.env` using the environment variables expected by the application. Configure the MongoDB URI and JWT secret before starting the server.

If the database is empty, seed the food catalog:

```bash
npm run seed:food
```

Create an administrator account using the provisioning script and its expected configuration:

```bash
npm run create:admin
```

Start the backend:

```bash
npm run server
```

Expected API port: `4000`.

### Step 3: Start the customer application

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Expected development URL: `http://localhost:5173`.

### Step 4: Start the administrator panel

Open another terminal:

```bash
cd admin
npm install
npm run dev
```

Expected development URL: `http://localhost:5174`.

The actual ports may differ if the configured ports are occupied.

## 10. Testing and Quality Assurance

The following verification results were reported during the project audit:

- Customer frontend linting completed with zero reported warnings and errors.
- Admin frontend linting completed with zero reported warnings and errors.
- Both Vite production builds completed successfully.
- The backend end-to-end suite contains 23 API assertions.
- A test checks that a normal user is denied access to administrator-only food operations.
- HTTP method compliance was reviewed, with no `.put()` calls reported.

Run the following commands to verify the project locally.

**Backend tests:**

```bash
cd backend
npm test
```

**Customer production build:**

```bash
cd frontend
npm run build
```

**Admin production build:**

```bash
cd admin
npm run build
```

The end-to-end tests require a working database and backend environment. Confirm the test results locally before treating the complete test suite as passing.

## 11. Security Considerations

- Passwords are hashed before being stored.
- JWT authentication is used to identify authenticated users.
- Administrative permissions are enforced by backend middleware.
- Checkout prices are calculated from food records stored in the database rather than trusted directly from client-submitted prices.
- Image uploads are restricted by file size and accepted image formats.
- Environment variables are used for sensitive configuration.
- The `.env` file should be excluded from version control.

## 12. Limitations and Future Enhancements

Potential future improvements include:

- Integration with online payment gateways.
- Deployment to a production hosting environment.
- Automated CI/CD pipeline integration.
- More comprehensive automated backend and frontend tests.
- Enhanced order notifications and delivery tracking.
- Improved accessibility and performance monitoring.

These are possible extensions rather than claims that the features are already implemented.

## 13. Conclusion

The Food Delivery System demonstrates the practical application of full-stack web development using the MERN stack. It combines customer-facing functionality, administrative management, REST API integration, database persistence, authentication, and authorization within a modular application architecture.

The project provides a foundation for understanding how frontend interfaces, backend services, and database operations work together to deliver a complete web application.

## Author

**Namrata Lamichhane**

MERN Stack Project | Computer Science with AI
