import { unlink } from 'node:fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import foodModel from '../models/foodModel.js'
import {
    createFoodImageUploadAuthorization,
    deleteCloudinaryImage,
    uploadImageBuffer,
    verifyFoodImageUpload,
} from '../config/cloudinary.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadDir = path.join(__dirname, '..', 'uploads')
const isRemoteImage = (image) => /^https?:\/\//i.test(image)

const removeLegacyImage = async (image) => {
    if (
        typeof image !== 'string' ||
        !image ||
        image.includes('/') ||
        image.includes('\\') ||
        path.basename(image) !== image
    ) {
        throw new Error('Stored legacy image is not a valid filename.')
    }

    try {
        await unlink(path.join(uploadDir, image))
    } catch (error) {
        if (error.code !== 'ENOENT') {
            throw error
        }
    }
}

const removeFoodImage = async (food) => {
    if (food.imagePublicId) {
        await deleteCloudinaryImage(food.imagePublicId)
        return
    }

    if (isRemoteImage(food.image)) {
        throw new Error('Remote image has no Cloudinary public ID.')
    }

    await removeLegacyImage(food.image)
}

const cleanupUploadedImage = async (uploadedImage, operation) => {
    if (!uploadedImage?.publicId) {
        return null
    }

    try {
        await deleteCloudinaryImage(uploadedImage.publicId)
        return null
    } catch (error) {
        console.error(`Cloudinary cleanup failed after ${operation}:`, error.message)
        return 'The uploaded image could not be cleaned up. Check backend logs.'
    }
}

const cleanupPreviousImage = async (food, operation) => {
    try {
        await removeFoodImage(food)
        return null
    } catch (error) {
        console.error(`Image cleanup failed after ${operation}:`, error.message)
        return 'The food item was saved, but its previous image could not be removed. Check backend logs.'
    }
}

const createRequestError = (statusCode, message) => {
    const error = new Error(message)
    error.statusCode = statusCode
    return error
}

const createFoodImageUploadSignature = (req, res) => {
    try {
        res.json({
            success: true,
            data: createFoodImageUploadAuthorization(),
        })
    } catch (error) {
        console.error('createFoodImageUploadSignature error:', error.message)
        res.status(500).json({
            success: false,
            message: 'Failed to prepare a secure image upload.',
        })
    }
}

// GET /api/food/list (public)
const listFood = async (req, res) => {
    try {
        const foods = await foodModel.find({})
        res.json({ success: true, data: foods })
    } catch (error) {
        console.error('listFood error:', error.message)
        res.status(500).json({ success: false, message: 'Failed to retrieve food list.' })
    }
}

// POST /api/food/add (admin — protected)
// Expects multipart/form-data: name, description, price, category + image file
const addFood = async (req, res) => {
    let uploadedImage

    try {
        const { imageUpload } = req.body || {}
        if (imageUpload) {
            uploadedImage = await verifyFoodImageUpload(imageUpload)
        }
        if (req.file && imageUpload) {
            throw createRequestError(400, 'Submit one food image upload at a time.')
        }
        if (!req.file && !uploadedImage) {
            throw createRequestError(400, 'Food image is required.')
        }

        const { name, description, price, category } = req.body || {}
        if (!name || !description || !price || !category) {
            throw createRequestError(400, 'All fields are required.')
        }

        const parsedPrice = Number(price)
        if (isNaN(parsedPrice) || parsedPrice < 0) {
            throw createRequestError(400, 'Price must be a non-negative number.')
        }

        if (!uploadedImage) {
            uploadedImage = await uploadImageBuffer(req.file.buffer)
        }
        const food = await foodModel.create({
            name: name.trim(),
            description: description.trim(),
            price: parsedPrice,
            image: uploadedImage.secureUrl,
            imagePublicId: uploadedImage.publicId,
            category,
        })

        res.status(201).json({ success: true, message: 'Food added successfully.', data: food })
    } catch (error) {
        const cleanupWarning = await cleanupUploadedImage(uploadedImage, 'food creation')
        console.error('addFood error:', error.message)
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Failed to add food item.',
            ...(error.cleanupWarning
                ? { cleanupWarning: error.cleanupWarning }
                : cleanupWarning
                    ? { cleanupWarning }
                    : {}),
        })
    }
}

// DELETE /api/food/remove (admin — protected)
// Expects JSON body: { id }
const removeFood = async (req, res) => {
    try {
        const { id } = req.body || {}
        if (!id) {
            return res.status(400).json({ success: false, message: 'Food item ID is required.' })
        }

        const food = await foodModel.findByIdAndDelete(id)
        if (!food) {
            return res.status(404).json({ success: false, message: 'Food item not found.' })
        }

        let cleanupWarning
        try {
            await removeFoodImage(food)
        } catch (error) {
            console.error('removeFood image cleanup error:', error.message)
            cleanupWarning = 'Food item was removed, but image cleanup failed. Check backend logs.'
        }

        res.json({
            success: true,
            message: 'Food item removed successfully.',
            ...(cleanupWarning ? { cleanupWarning } : {}),
        })
    } catch (error) {
        console.error('removeFood error:', error.message)
        res.status(500).json({ success: false, message: 'Failed to remove food item.' })
    }
}

// PATCH /api/food/update (admin — protected)
// Expects multipart/form-data or JSON: id, name, description, price, category, optional image
const updateFood = async (req, res) => {
    let uploadedImage
    let updateCommitted = false

    try {
        const { imageUpload } = req.body || {}
        if (imageUpload) {
            uploadedImage = await verifyFoodImageUpload(imageUpload)
        }
        if (req.file && imageUpload) {
            throw createRequestError(400, 'Submit one food image upload at a time.')
        }

        const { id, _id, name, description, price, category } = req.body || {}
        const foodId = id || _id

        if (!foodId) {
            throw createRequestError(400, 'Food item ID is required.')
        }

        const food = await foodModel.findById(foodId)
        if (!food) {
            throw createRequestError(404, 'Food item not found.')
        }

        const updates = {}

        if (name !== undefined) {
            if (typeof name !== 'string' || !name.trim()) {
                throw createRequestError(400, 'Name cannot be empty.')
            }
            updates.name = name.trim()
        }

        if (description !== undefined) {
            if (typeof description !== 'string' || !description.trim()) {
                throw createRequestError(400, 'Description cannot be empty.')
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
                throw createRequestError(
                    400,
                    `Invalid category. Allowed: ${validCategories.join(', ')}`
                )
            }
            updates.category = category
        }

        if (price !== undefined) {
            const parsedPrice = Number(price)
            if (isNaN(parsedPrice) || parsedPrice < 0) {
                throw createRequestError(400, 'Price must be a non-negative number.')
            }
            updates.price = parsedPrice
        }

        if (req.file) {
            uploadedImage = await uploadImageBuffer(req.file.buffer)
        }

        if (uploadedImage) {
            updates.image = uploadedImage.secureUrl
            updates.imagePublicId = uploadedImage.publicId
        }

        const updatedFood = await foodModel.findByIdAndUpdate(
            foodId,
            { $set: updates },
            { new: true, runValidators: true }
        )

        if (!updatedFood) {
            throw createRequestError(404, 'Food item not found.')
        }
        updateCommitted = true

        const cleanupWarning = uploadedImage
            ? await cleanupPreviousImage(food, 'food image replacement')
            : null

        res.json({
            success: true,
            message: 'Food item updated successfully.',
            data: updatedFood,
            ...(cleanupWarning ? { cleanupWarning } : {}),
        })
    } catch (error) {
        const cleanupWarning = updateCommitted
            ? null
            : await cleanupUploadedImage(uploadedImage, 'food update')
        console.error('updateFood error:', error.message)
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.statusCode ? error.message : 'Failed to update food item.',
            ...(error.cleanupWarning
                ? { cleanupWarning: error.cleanupWarning }
                : cleanupWarning
                    ? { cleanupWarning }
                    : {}),
        })
    }
}

export {
    listFood,
    addFood,
    removeFood,
    updateFood,
    createFoodImageUploadSignature,
}
