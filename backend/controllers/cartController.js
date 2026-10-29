import userModel from '../models/userModel.js'
import foodModel from '../models/foodModel.js'

// POST /api/cart/add  (protected)
// Body: { itemId }  — increments quantity by 1
const addToCart = async (req, res) => {
    try {
        const { itemId } = req.body
        const userId = req.userId

        if (!itemId) {
            return res.status(400).json({ success: false, message: 'itemId is required.' })
        }

        // Verify the food item exists before adding to cart
        const foodExists = await foodModel.findById(itemId)
        if (!foodExists) {
            return res.status(404).json({ success: false, message: 'Food item not found.' })
        }

        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' })
        }

        // Build updated cartData
        const cartData = { ...user.cartData }
        cartData[itemId] = (cartData[itemId] || 0) + 1

        await userModel.findByIdAndUpdate(userId, { cartData })
        res.json({ success: true, message: 'Item added to cart.' })
    } catch (error) {
        console.error('addToCart error:', error.message)
        res.status(500).json({ success: false, message: 'Failed to add item to cart.' })
    }
}

// DELETE /api/cart/remove  (protected)
// Body: { itemId, removeAll? }
// If removeAll is true, deletes the item completely.
// Otherwise decrements quantity by 1, removing key when quantity reaches 0.
const removeFromCart = async (req, res) => {
    try {
        const { itemId, removeAll } = req.body
        const userId = req.userId

        if (!itemId) {
            return res.status(400).json({ success: false, message: 'itemId is required.' })
        }

        const user = await userModel.findById(userId)
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' })
        }

        const cartData = { ...user.cartData }

        if (!cartData[itemId] || cartData[itemId] <= 0) {
            return res
                .status(400)
                .json({ success: false, message: 'Item is not in the cart.' })
        }

        if (removeAll) {
            delete cartData[itemId]
        } else {
            cartData[itemId] -= 1
            if (cartData[itemId] === 0) {
                delete cartData[itemId]
            }
        }

        await userModel.findByIdAndUpdate(userId, { $set: { cartData } })
        res.json({ success: true, message: 'Item removed from cart.' })
    } catch (error) {
        console.error('removeFromCart error:', error.message)
        res.status(500).json({ success: false, message: 'Failed to remove item from cart.' })
    }
}

// GET /api/cart/get  (protected)
// Returns the user's full cartData object { itemId: quantity }
const getCart = async (req, res) => {
    try {
        const userId = req.userId

        const user = await userModel.findById(userId).select('cartData')
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' })
        }

        res.json({ success: true, cartData: user.cartData })
    } catch (error) {
        console.error('getCart error:', error.message)
        res.status(500).json({ success: false, message: 'Failed to retrieve cart.' })
    }
}

export { addToCart, removeFromCart, getCart }
