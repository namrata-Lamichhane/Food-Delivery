import express from 'express'
import multer from 'multer'
import path from 'path'
import { adminMiddleware } from '../middleware/auth.js'
import {
    listFood,
    addFood,
    removeFood,
    updateFood,
    createFoodImageUploadSignature,
} from '../controllers/foodController.js'

const foodRouter = express.Router()

// Accept only common image types
const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase())
    const mimeOk = allowed.test(file.mimetype)
    if (extOk && mimeOk) {
        cb(null, true)
    } else {
        cb(new Error('Only JPEG, PNG, and WebP images are allowed.'))
    }
}

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
})

// GET /api/food/list  — public: returns all food items
foodRouter.get('/list', listFood)

// POST /api/food/upload-signature — protected (admin): authorize a direct Cloudinary upload
foodRouter.post('/upload-signature', adminMiddleware, createFoodImageUploadSignature)

// POST /api/food/add  — protected (admin): upload image + create food document
foodRouter.post('/add', adminMiddleware, upload.single('image'), addFood)

// PATCH /api/food/update  — protected (admin): edit food item + optional new image
// Uses PATCH (never PUT) as required by project rules
foodRouter.patch('/update', adminMiddleware, upload.single('image'), updateFood)

// DELETE /api/food/remove  — protected (admin): remove food item + image file
foodRouter.delete('/remove', adminMiddleware, removeFood)

export default foodRouter
