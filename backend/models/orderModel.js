import mongoose from 'mongoose'

// Sub-schema for each item line in an order
const orderItemSchema = new mongoose.Schema(
    {
        // The MongoDB _id of the food item (as a string, since frontend uses string IDs)
        _id: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        image: { type: String, required: true },
        category: { type: String, required: true },
    },
    { _id: false } // Items use their own _id field; don't auto-generate a second one
)

// Sub-schema for the delivery address
// Field names match the PlaceOrder.jsx form inputs exactly
const addressSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        province: { type: String, required: true, trim: true },
        postalCode: { type: String, required: true, trim: true },
        country: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
    },
    { _id: false }
)

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: 'Order must contain at least one item',
            },
        },
        // Grand total in Rs. (subtotal + delivery fee), calculated on the server
        amount: {
            type: Number,
            required: true,
            min: [0, 'Amount cannot be negative'],
        },
        address: {
            type: addressSchema,
            required: true,
        },
        // Order lifecycle statuses
        status: {
            type: String,
            enum: [
                'Food Processing',
                'Out for Delivery',
                'Delivered',
                'Cancelled',
            ],
            default: 'Food Processing',
        },
        // Whether payment has been confirmed (false until Stripe webhook confirms, or COD marks true on delivery)
        payment: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
)

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema)

export default orderModel
