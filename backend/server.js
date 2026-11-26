import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import path from 'path'
import { fileURLToPath } from 'url'

// Resolve __dirname in ES module context
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure environment variables are loaded regardless of current working directory
dotenv.config({ path: path.join(__dirname, '.env') })

import connectDB from './config/db.js'
import userRouter from './routes/userRoute.js'
import foodRouter from './routes/foodRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'

// app config
const app = express()
const configuredOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
const allowedOrigins = new Set(configuredOrigins)

if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.add('http://localhost:5173')
    allowedOrigins.add('http://localhost:5174')
    allowedOrigins.add('http://localhost:5175')
    allowedOrigins.add('http://127.0.0.1:5173')
    allowedOrigins.add('http://127.0.0.1:5175')
}

if (process.env.NODE_ENV === 'production' && configuredOrigins.length === 0) {
    throw new Error('CORS_ORIGINS must contain the allowed production frontend origins.')
}

// middleware
app.use(express.json())
app.use(
    cors({
        origin: (origin, callback) => {
            callback(null, !origin || allowedOrigins.has(origin))
        },
    })
)

app.use('/api', async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }

    try {
        await connectDB()
        next()
    } catch (error) {
        console.error('API database connection failed:', error.name)
        res.status(503).json({
            success: false,
            message: 'Database is temporarily unavailable.',
        })
    }
})

// Keep serving bundled and legacy local images during the Cloudinary migration.
app.use('/images', express.static(path.join(__dirname, 'uploads')))

// application routes — GET, POST, PATCH, DELETE only (no PUT)
app.use('/api/user', userRouter)
app.use('/api/food', foodRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)

// health check
app.get('/', (req, res) => {
    res.json({ success: true, message: 'API Working' })
})

app.get('/healthz', (req, res) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ success: false, message: 'Database is not ready.' })
    }

    res.json({ success: true, database: 'connected' })
})

export default app
