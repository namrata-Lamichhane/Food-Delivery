import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
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
const port = process.env.PORT || 4000

// connect to database
connectDB()

// middleware
app.use(express.json())
app.use(cors())

// serve uploaded food images as static files
// Frontend accesses them as: http://localhost:4000/images/<filename>
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

app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`)
})
