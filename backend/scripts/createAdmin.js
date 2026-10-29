import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import userModel from '../models/userModel.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const email = process.argv[2] || 'admin@fooddel.com'
const password = process.argv[3] || 'Admin1234!'
const name = process.argv[4] || 'System Administrator'

async function setupAdmin() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('Error: MONGODB_URI not found in backend/.env')
            process.exit(1)
        }

        await mongoose.connect(process.env.MONGODB_URI)
        console.log('Connected to MongoDB.')

        const normalizedEmail = email.toLowerCase().trim()
        const existing = await userModel.findOne({ email: normalizedEmail })

        if (existing) {
            existing.role = 'admin'
            if (process.argv[3]) {
                const salt = await bcrypt.genSalt(10)
                existing.password = await bcrypt.hash(password, salt)
            }
            await existing.save()
            console.log(`\n✅ Account updated to administrator:`)
            console.log(`   Email: ${existing.email}`)
            console.log(`   Name:  ${existing.name}`)
            console.log(`   Role:  ${existing.role}`)
        } else {
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(password, salt)

            const admin = await userModel.create({
                name,
                email: normalizedEmail,
                password: hashedPassword,
                role: 'admin',
                cartData: {},
            })

            console.log(`\n✅ New administrator account created successfully:`)
            console.log(`   Email:    ${admin.email}`)
            console.log(`   Password: ${password}`)
            console.log(`   Role:     ${admin.role}`)
        }
    } catch (err) {
        console.error('Failed to create/update admin account:', err.message)
    } finally {
        await mongoose.disconnect()
        console.log('Disconnected from MongoDB.\n')
    }
}

setupAdmin()

