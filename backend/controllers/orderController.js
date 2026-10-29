import orderModel from '../models/orderModel.js'
import userModel from '../models/userModel.js'
import foodModel from '../models/foodModel.js'

const DELIVERY_FEE = 50 // Must match frontend DELIVERY_FEE constant

// POST /api/order/place  (protected)
// Body: { items: [{ _id, quantity }], address }
// Server re-fetches prices from DB — client-provided prices are ignored
const placeOrder = async (req, res) => {
    try {
        const userId = req.userId
        const { items, address } = req.body

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized. Please log in.',
            })
        }

        // 1. Validate payload structure
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res
                .status(400)
                .json({ success: false, message: 'Order must contain at least one item.' })
        }

        if (!address || typeof address !== 'object' || Array.isArray(address)) {
            return res
                .status(400)
                .json({ success: false, message: 'Delivery address is required.' })
        }

        const requiredAddressFields = [
            'firstName',
            'lastName',
            'email',
            'street',
            'city',
            'province',
            'postalCode',
            'country',
            'phone',
        ]
        const hasMissingAddressField = requiredAddressFields.some(
            (field) =>
                typeof address[field] !== 'string' ||
                address[field].trim().length === 0
        )

        if (hasMissingAddressField) {
            return res.status(400).json({
                success: false,
                message: 'Please complete all delivery address fields.',
            })
        }

        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' })
        }

        // 2. Re-fetch each food item from DB and compute the real amount
        const orderItems = []
        let subtotal = 0

        for (const clientItem of items) {
            if (!clientItem._id || !clientItem.quantity || clientItem.quantity < 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Each item must have a valid _id and quantity ≥ 1.',
                })
            }

            const food = await foodModel.findById(clientItem._id)
            if (!food) {
                return res.status(404).json({
                    success: false,
                    message: `Food item not found: ${clientItem._id}`,
                })
            }

            const quantity = Number(clientItem.quantity)
            subtotal += food.price * quantity

            orderItems.push({
                _id: String(food._id),
                name: food.name,
                price: food.price, // server-trusted price
                quantity,
                image: food.image,
                category: food.category,
            })
        }

        const amount = subtotal + DELIVERY_FEE

        // 3. Create the order
        const order = await orderModel.create({
            userId,
            items: orderItems,
            amount,
            address,
            payment: false, // Cash on Delivery: not paid yet
        })

        // 4. Clear the user's cart after placing the order
        await userModel.findByIdAndUpdate(userId, { cartData: {} })

        res.status(201).json({
            success: true,
            message: 'Order placed successfully.',
            orderId: order._id,
            amount,
        })
    } catch (error) {
        console.error('placeOrder error:', error.message)
        res.status(500).json({ success: false, message: 'Failed to place order.' })
    }
}

// GET /api/order/userorders  (protected)
// Returns all orders for the authenticated user
const userOrders = async (req, res) => {
    try {
        const orders = await orderModel
            .find({ userId: req.userId })
            .sort({ createdAt: -1 })

        res.json({ success: true, data: orders })
    } catch (error) {
        console.error('userOrders error:', error.message)
        res.status(500).json({ success: false, message: 'Failed to retrieve orders.' })
    }
}

// GET /api/order/list  (admin — protected)
// Returns all orders across all users
const listOrders = async (req, res) => {
    try {
        const orders = await orderModel.find({}).sort({ createdAt: -1 })
        res.json({ success: true, data: orders })
    } catch (error) {
        console.error('listOrders error:', error.message)
        res.status(500).json({ success: false, message: 'Failed to retrieve orders.' })
    }
}

// PATCH /api/order/status  (admin — protected)
// Body: { orderId, status }
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body

        if (!orderId || !status) {
            return res
                .status(400)
                .json({ success: false, message: 'orderId and status are required.' })
        }

        const validStatuses = ['Food Processing', 'Out for Delivery', 'Delivered', 'Cancelled']
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
            })
        }

        const order = await orderModel.findByIdAndUpdate(
            orderId,
            { status },
            { new: true, runValidators: true }
        )

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' })
        }

        res.json({ success: true, message: 'Order status updated.', data: order })
    } catch (error) {
        console.error('updateOrderStatus error:', error.message)
        res.status(500).json({ success: false, message: 'Failed to update order status.' })
    }
}

// GET /api/order/dashboard  (admin — protected)
// Computes real-time statistics directly from MongoDB collections:
// - total food items
// - total registered users
// - total orders
// - total revenue (from non-cancelled orders)
// - status counts
// - recent 5 orders
const getDashboardStats = async (req, res) => {
    try {
        const [totalFoods, totalUsers, totalOrders, orders] = await Promise.all([
            foodModel.countDocuments(),
            userModel.countDocuments(),
            orderModel.countDocuments(),
            orderModel.find({}).sort({ createdAt: -1 }),
        ])

        // Calculate total revenue from non-cancelled orders
        let totalRevenue = 0
        const statusCounts = {
            'Food Processing': 0,
            'Out for Delivery': 0,
            Delivered: 0,
            Cancelled: 0,
        }

        for (const order of orders) {
            if (order.status !== 'Cancelled') {
                totalRevenue += Number(order.amount) || 0
            }
            if (statusCounts[order.status] !== undefined) {
                statusCounts[order.status] += 1
            } else {
                statusCounts[order.status] = 1
            }
        }

        const recentOrders = orders.slice(0, 5)

        res.json({
            success: true,
            data: {
                totalFoods,
                totalUsers,
                totalOrders,
                totalRevenue,
                statusCounts,
                recentOrders,
            },
        })
    } catch (error) {
        console.error('getDashboardStats error:', error.message)
        res.status(500).json({ success: false, message: 'Failed to calculate dashboard statistics.' })
    }
}

export { placeOrder, userOrders, listOrders, updateOrderStatus, getDashboardStats }
