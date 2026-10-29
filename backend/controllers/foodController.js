import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import foodModel from '../models/foodModel.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadDir = path.join(__dirname, '..', 'uploads')

// GET /api/food/list  (public)
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({})
        res.json({ success: true, data: foods })
    } catch (error) {
        console.error('listFood error:', error.message)
        res.status(500).json({ success: false, message: 'Failed to retrieve food list.' })
    }
}

// POST /api/food/add  (admin — protected)
// Expects multipart/form-data: name, description, price, category + image file
const addFood = async (req, res) => {
    try {
        // multer attaches the uploaded file to req.file
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Food image is required.' })
        }

        const { name, description, price, category } = req.body

        if (!name || !description || !price || !category) {
            // Clean up the uploaded file if validation fails
            fs.unlink(req.file.path, () => {})
            return res
                .status(400)
                .json({ success: false, message: 'All fields are required.' })
        }

        const parsedPrice = Number(price)
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            fs.unlink(req.file.path, () => {})
            return res
                .status(400)
                .json({ success: false, message: 'Price must be a non-negative number.' })
        }

        const food = await foodModel.create({
            name: name.trim(),
            description: description.trim(),
            price: parsedPrice,
            image: req.file.filename, // store only the filename
            category,
        })

        res.status(201).json({ success: true, message: 'Food added successfully.', data: food })
    } catch (error) {
        // Clean up orphaned upload on unexpected error
        if (req.file) fs.unlink(req.file.path, () => {})
        console.error('addFood error:', error.message)
        res.status(500).json({ success: false, message: 'Failed to add food item.' })
    }
}

// DELETE /api/food/remove  (admin — protected)
// Expects JSON body: { id }
const removeFood = async (req, res) => {
    try {
        const { id } = req.body

        if (!id) {
            return res.status(400).json({ success: false, message: 'Food item ID is required.' })
        }

        const food = await foodModel.findById(id)
        if (!food) {
            return res.status(404).json({ success: false, message: 'Food item not found.' })
        }

        // Delete the associated image file from disk
        const imagePath = path.join(uploadDir, food.image)
        if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
                if (err) console.warn('Could not delete image file:', food.image)
            })
        }

        await foodModel.findByIdAndDelete(id)
        res.json({ success: true, message: 'Food item removed successfully.' })
    } catch (error) {
        console.error('removeFood error:', error.message)
        res.status(500).json({ success: false, message: 'Failed to remove food item.' })
    }
}

// PATCH /api/food/update  (admin — protected)
// Expects multipart/form-data or JSON: id, name, description, price, category, optional image
const updateFood = async (req, res) => {
    try {
        const { id, _id, name, description, price, category } = req.body
        const foodId = id || _id

        if (!foodId) {
            if (req.file) fs.unlink(req.file.path, () => {})
            return res.status(400).json({ success: false, message: 'Food item ID is required.' })
        }

        const food = await foodModel.findById(foodId)
        if (!food) {
            if (req.file) fs.unlink(req.file.path, () => {})
            return res.status(404).json({ success: false, message: 'Food item not found.' })
        }

        const updates = {}

        if (name !== undefined) {
            if (typeof name !== 'string' || !name.trim()) {
                if (req.file) fs.unlink(req.file.path, () => {})
                return res.status(400).json({ success: false, message: 'Name cannot be empty.' })
            }
            updates.name = name.trim()
        }

        if (description !== undefined) {
            if (typeof description !== 'string' || !description.trim()) {
                if (req.file) fs.unlink(req.file.path, () => {})
                return res.status(400).json({ success: false, message: 'Description cannot be empty.' })
            }
            updates.description = description.trim()
        }

        if (category !== undefined) {
            const validCategories = [
                'Salad',
                'Rolls',
                'Desserts',
                'Sandwich',
                'Cake',
                'Pure Veg',
                'Pasta',
                'Noodles',
            ]
            if (!validCategories.includes(category)) {
                if (req.file) fs.unlink(req.file.path, () => {})
                return res.status(400).json({
                    success: false,
                    message: `Invalid category. Allowed: ${validCategories.join(', ')}`,
                })
            }
            updates.category = category
        }

        if (price !== undefined) {
            const parsedPrice = Number(price)
            if (isNaN(parsedPrice) || parsedPrice < 0) {
                if (req.file) fs.unlink(req.file.path, () => {})
                return res.status(400).json({ success: false, message: 'Price must be a non-negative number.' })
            }
            updates.price = parsedPrice
        }

        if (req.file) {
            const oldImage = food.image
            updates.image = req.file.filename

            // Clean up previous image if it was an uploaded file (check if file exists in uploads)
            if (oldImage && oldImage !== req.file.filename) {
                const oldPath = path.join(uploadDir, oldImage)
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath, (err) => {
                        if (err) console.warn('Could not delete old image file:', oldImage)
                    })
                }
            }
        }

        const updatedFood = await foodModel.findByIdAndUpdate(
            foodId,
            { $set: updates },
            { new: true, runValidators: true }
        )

        res.json({
            success: true,
            message: 'Food item updated successfully.',
            data: updatedFood,
        })
    } catch (error) {
        if (req.file) fs.unlink(req.file.path, () => {})
        console.error('updateFood error:', error.message)
        res.status(500).json({ success: false, message: 'Failed to update food item.' })
    }
}

export { listFood, addFood, removeFood, updateFood }
