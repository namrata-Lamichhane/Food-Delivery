import express from 'express'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'
import {
    placeOrder,
    userOrders,
    listOrders,
    updateOrderStatus,
    getDashboardStats,
} from '../controllers/orderController.js'

const orderRouter = express.Router()

// POST /api/order/place  — protected: place a new order (Cash on Delivery)
orderRouter.post('/place', authMiddleware, placeOrder)

// GET /api/order/userorders  — protected: get orders for the logged-in user
orderRouter.get('/userorders', authMiddleware, userOrders)

// GET /api/order/dashboard  — protected (admin): get summary metrics
orderRouter.get('/dashboard', adminMiddleware, getDashboardStats)

// GET /api/order/list  — protected (admin): get all orders
orderRouter.get('/list', adminMiddleware, listOrders)

// PATCH /api/order/status  — protected (admin): update order status
// Uses PATCH (never PUT) as required by project rules
orderRouter.patch('/status', adminMiddleware, updateOrderStatus)

export default orderRouter
