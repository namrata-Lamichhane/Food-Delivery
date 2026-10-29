import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        // Always stored as a bcrypt hash — never plaintext
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        // Stores the user's cart as { itemId: quantity }.
        // Using Object type because item IDs are dynamic keys.
        cartData: {
            type: Object,
            default: {},
        },
        // Role: 'user' for customers, 'admin' for administrators
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
    },
    {
        timestamps: true,
        // Allows dynamic keys inside cartData to be saved correctly
        minimize: false,
    }
)

const userModel = mongoose.models.user || mongoose.model('user', userSchema)

export default userModel
