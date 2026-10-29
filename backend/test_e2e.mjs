// Phase E — End-to-end backend API test
// Tests: health, register, login, food list, food add (with real image), cart, order
// Run: node test_e2e.mjs  (from backend/ folder, while server is running on :4000)

import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import mongoose from 'mongoose'
import { fileURLToPath } from 'url'
import userModel from './models/userModel.js'
import orderModel from './models/orderModel.js'
import foodModel from './models/foodModel.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = 'http://localhost:4000'
const TEST_EMAIL = 'e2e_test_user@fooddel.test'
const TEST_PASSWORD = 'TestPass2026!'

let passed = 0
let failed = 0
let token = ''
let testFoodId = ''

const ok = (label, condition, detail = '') => {
    if (condition) { console.log(`  ✅ ${label}`); passed++ }
    else { console.log(`  ❌ ${label}${detail ? ' — ' + detail : ''}`); failed++ }
}

const json = async (path, opts = {}) => {
    const res = await fetch(`${BASE}${path}`, opts)
    const data = await res.json().catch(() => ({}))
    return { status: res.status, data }
}

const authOpts = (body, method = 'POST') => ({
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
})

// ── Cleanup helper ─────────────────────────────────────────────────────────
const cleanup = async () => {
    await mongoose.connect(process.env.MONGODB_URI)
    await userModel.deleteMany({ email: TEST_EMAIL })
    await orderModel.deleteMany({ 'address.email': TEST_EMAIL })
    // Remove food items added by this test
    await foodModel.deleteMany({ name: 'E2E Test Burger' })
    await mongoose.disconnect()
}

async function run() {
    console.log('\n══════════════════════════════════════════════════════')
    console.log('  Food Del — Phase E End-to-End Backend Test')
    console.log('══════════════════════════════════════════════════════\n')

    await cleanup()

    // ── 1. Health ──────────────────────────────────────────────────────────
    console.log('1. API Health')
    const health = await json('/')
    ok('GET / → 200', health.status === 200)
    ok('success: true', health.data.success === true)

    // ── 2. Registration ────────────────────────────────────────────────────
    console.log('\n2. User Registration')
    const reg = await json('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'E2E Tester', email: TEST_EMAIL, password: TEST_PASSWORD }),
    })
    ok('POST /api/user/register → 201', reg.status === 201)
    ok('returns JWT token', typeof reg.data.token === 'string' && reg.data.token.length > 10)
    token = reg.data.token

    // Duplicate
    const dup = await json('/api/user/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'E2E Tester', email: TEST_EMAIL, password: TEST_PASSWORD }),
    })
    ok('Duplicate email → 409', dup.status === 409)

    // ── 3. Login ───────────────────────────────────────────────────────────
    console.log('\n3. User Login')
    const login = await json('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    })
    ok('POST /api/user/login → 200', login.status === 200)
    ok('returns JWT token', typeof login.data.token === 'string')
    token = login.data.token  // use fresh login token

    const badLogin = await json('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: TEST_EMAIL, password: 'wrong' }),
    })
    ok('Wrong password → 401', badLogin.status === 401)

    // ── 4. Auth middleware ─────────────────────────────────────────────────
    console.log('\n4. Auth Middleware')
    const noAuth = await json('/api/cart/get')
    ok('No token → 401', noAuth.status === 401)

    // ── 4b. Admin Authorization Guard ───────────────────────────────────────
    console.log('\n4b. Admin Authorization Guard')
    const unauthAdd = await fetch(`${BASE}/api/food/add`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
    })
    ok('Ordinary user blocked from POST /api/food/add → 403', unauthAdd.status === 403)

    // Promote test user to admin in DB so remaining admin endpoints can be tested
    await mongoose.connect(process.env.MONGODB_URI)
    await userModel.updateOne({ email: TEST_EMAIL }, { role: 'admin' })
    await mongoose.disconnect()
    console.log('     ℹ️  Test user promoted to administrator in DB')

    // ── 5. Food list (current state) ───────────────────────────────────────
    console.log('\n5. Food List')
    const foodList = await json('/api/food/list')
    ok('GET /api/food/list → 200', foodList.status === 200)
    ok('data is array', Array.isArray(foodList.data.data))
    const existingCount = foodList.data.data.length
    console.log(`     ℹ️  ${existingCount} food item(s) currently in database`)

    // ── 6. Add a food item via multipart/form-data ────────────────────────
    console.log('\n6. Add Food Item (POST /api/food/add)')

    // Create a minimal 1×1 white PNG programmatically (no external file needed)
    // PNG header + IHDR + IDAT + IEND for a 1x1 white pixel
    const pngBytes = Buffer.from(
        '89504e470d0a1a0a0000000d49484452000000010000000108020000009001' +
        '2e0000000c494441540801636060600000000400018dd3f50000000049454e44ae426082',
        'hex'
    )
    const tmpImg = path.join(__dirname, '_e2e_test_img.png')
    fs.writeFileSync(tmpImg, pngBytes)

    try {
        const form = new FormData()
        form.append('name', 'E2E Test Burger')
        form.append('description', 'A test food item created by the Phase E test suite')
        form.append('price', '350')
        form.append('category', 'Rolls')
        form.append('image', new Blob([pngBytes], { type: 'image/png' }), 'test_burger.png')

        const addRes = await fetch(`${BASE}/api/food/add`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: form,
        })
        const addData = await addRes.json()
        ok('POST /api/food/add → 201', addRes.status === 201)
        ok('food created with correct name', addData.data?.name === 'E2E Test Burger')
        ok('price stored correctly', addData.data?.price === 350)
        testFoodId = addData.data?._id
        console.log(`     ℹ️  Created food _id: ${testFoodId}`)
    } finally {
        fs.unlink(tmpImg, () => {})
    }

    // ── 7. Verify food list updated ────────────────────────────────────────
    console.log('\n7. Food List After Add')
    const foodList2 = await json('/api/food/list')
    ok('food count increased by 1', foodList2.data.data.length === existingCount + 1)

    // ── 8. Cart operations ─────────────────────────────────────────────────
    console.log('\n8. Cart API')
    if (!testFoodId) {
        console.log('     ⚠️  Skipping — no food ID available')
    } else {
        const addCart = await json('/api/cart/add', authOpts({ itemId: testFoodId }))
        ok('POST /api/cart/add → 200', addCart.status === 200)

        const addCart2 = await json('/api/cart/add', authOpts({ itemId: testFoodId }))
        ok('POST /api/cart/add second time → 200', addCart2.status === 200)

        const getCart = await json('/api/cart/get', {
            headers: { Authorization: `Bearer ${token}` },
        })
        ok('GET /api/cart/get → 200', getCart.status === 200)
        ok('item count is 2', getCart.data.cartData?.[testFoodId] === 2)

        // Remove one unit
        const remCart = await json('/api/cart/remove', authOpts({ itemId: testFoodId }, 'DELETE'))
        ok('DELETE /api/cart/remove → 200', remCart.status === 200)

        const getCart2 = await json('/api/cart/get', {
            headers: { Authorization: `Bearer ${token}` },
        })
        ok('item count is now 1 after remove', getCart2.data.cartData?.[testFoodId] === 1)
    }

    // ── 9. Order placement ─────────────────────────────────────────────────
    console.log('\n9. Order API — Cash on Delivery')
    if (!testFoodId) {
        console.log('     ⚠️  Skipping — no food ID available')
    } else {
        const address = {
            firstName: 'E2E', lastName: 'Tester', email: TEST_EMAIL,
            street: '1 Test St', city: 'Kathmandu', province: 'Bagmati',
            postalCode: '44600', country: 'Nepal', phone: '9800000001',
        }

        const orderRes = await json('/api/order/place', authOpts({ items: [{ _id: testFoodId, quantity: 2 }], address }))
        ok('POST /api/order/place → 201', orderRes.status === 201)
        ok('returns orderId', typeof orderRes.data.orderId === 'string')

        // Server-side price: 350 × 2 + 50 delivery = 750
        ok('server-calculated amount = Rs. 750', orderRes.data.amount === 750)
        console.log(`     ℹ️  Verified: amount = 350×2 + 50 delivery = ${orderRes.data.amount}`)

        // Cart must be cleared
        const clearedCart = await json('/api/cart/get', {
            headers: { Authorization: `Bearer ${token}` },
        })
        ok('cart cleared after order', Object.keys(clearedCart.data.cartData || {}).length === 0)

        // User orders
        const myOrders = await json('/api/order/userorders', {
            headers: { Authorization: `Bearer ${token}` },
        })
        ok('GET /api/order/userorders → 200', myOrders.status === 200)
        ok('order in user history', myOrders.data.data?.length > 0)

        // PATCH status
        const orderId = orderRes.data.orderId
        const patchRes = await json('/api/order/status', authOpts({ orderId, status: 'Out for Delivery' }, 'PATCH'))
        ok('PATCH /api/order/status → 200', patchRes.status === 200)
        ok('status updated correctly', patchRes.data.data?.status === 'Out for Delivery')

        // Invalid status rejected
        const badStatus = await json('/api/order/status', authOpts({ orderId, status: 'InvalidStatus' }, 'PATCH'))
        ok('Invalid status → 400', badStatus.status === 400)
    }

    // ── 10. API method compliance ──────────────────────────────────────────
    console.log('\n10. API Method Compliance')
    const putTest = await fetch(`${BASE}/api/user/login`, { method: 'PUT' })
    ok('PUT route does not exist (404/405)', putTest.status === 404 || putTest.status === 405)

    // ── Cleanup ────────────────────────────────────────────────────────────
    await cleanup()

    // ── Summary ────────────────────────────────────────────────────────────
    console.log('\n══════════════════════════════════════════════════════')
    console.log(`  Results: ${passed} passed  |  ${failed} failed`)
    console.log('══════════════════════════════════════════════════════\n')

    if (failed > 0) process.exit(1)
}

run().catch((err) => {
    console.error('\nTest runner crashed:', err.message)
    process.exit(1)
})
