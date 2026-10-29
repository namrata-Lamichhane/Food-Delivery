import express from 'express'
import authMiddleware from '../middleware/auth.js'
import { addToCart, removeFromCart, getCart } from '../controllers/cartController.js'

const cartRouter = express.Router()

// All cart routes require authentication
// POST /api/cart/add  — add one unit of an item
cartRouter.post('/add', authMiddleware, addToCart)

// DELETE /api/cart/remove  — remove one unit (or whole item if quantity reaches 0)
cartRouter.delete('/remove', authMiddleware, removeFromCart)

// GET /api/cart/get  — retrieve the full cart for the authenticated user
cartRouter.get('/get', authMiddleware, getCart)

export default cartRouter
