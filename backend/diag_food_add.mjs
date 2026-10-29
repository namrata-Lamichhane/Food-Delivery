// Diagnose the food/add endpoint
import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = 'http://localhost:4000'

// 1. Register a temp user to get a token
const reg = await fetch(`${BASE}/api/user/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'DiagUser', email: 'diag_tmp@test.test', password: 'DiagPass123' }),
})
const { token } = await reg.json()
console.log('Token obtained:', token ? 'yes' : 'NO TOKEN')

// Promote diag user to admin
import mongoose from 'mongoose'
import userModel from './models/userModel.js'
import foodModel from './models/foodModel.js'
await mongoose.connect(process.env.MONGODB_URI)
await userModel.updateOne({ email: 'diag_tmp@test.test' }, { role: 'admin' })
await mongoose.disconnect()

// 2. Build a minimal valid PNG (1x1 white pixel)
const pngBytes = Buffer.from(
    '89504e470d0a1a0a0000000d49484452000000010000000108020000009001' +
    '2e0000000c494441540801636060600000000400018dd3f50000000049454e44ae426082',
    'hex'
)

const form = new FormData()
form.append('name', 'Diag Burger')
form.append('description', 'Diagnosis test food item')
form.append('price', '200')
form.append('category', 'Rolls')
form.append('image', new Blob([pngBytes], { type: 'image/png' }), 'diag.png')

const res = await fetch(`${BASE}/api/food/add`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
})

console.log('Status:', res.status)
const body = await res.text()
console.log('Response body:', body)

// Cleanup
await mongoose.connect(process.env.MONGODB_URI)
await userModel.deleteMany({ email: 'diag_tmp@test.test' })
await foodModel.deleteMany({ name: 'Diag Burger' })
await mongoose.disconnect()
console.log('Cleaned up.')
