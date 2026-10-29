import mongoose from 'mongoose'

const foodSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: () => new mongoose.Types.ObjectId().toString(),
        },
        name: {
            type: String,
            required: [true, 'Food name is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        image: {
            // Stores only the filename (e.g. "food_1.png").
            // The full URL is constructed by the frontend as: url + '/images/' + image
            type: String,
            required: [true, 'Image filename is required'],
        },
        category: {
            type: String,
            required: [true, 'Category is required'],
            enum: [
                'Salad',
                'Rolls',
                'Desserts',
                'Sandwich',
                'Cake',
                'Pure Veg',
                'Pasta',
                'Noodles',
            ],
        },
    },
    { timestamps: true }
)

const foodModel = mongoose.models.food || mongoose.model('food', foodSchema)

export default foodModel
