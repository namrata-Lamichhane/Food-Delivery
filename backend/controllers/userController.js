import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import validator from 'validator'
import userModel from '../models/userModel.js'

// Helper: sign a JWT token for a given user _id
const createToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' })

// POST /api/user/login
const loginUser = async (req, res) => {
    const { email, password } = req.body

    try {
        // 1. Basic field presence check
        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, message: 'Email and password are required.' })
        }

        // 2. Find user by email
        const user = await userModel.findOne({ email: email.toLowerCase().trim() })
        if (!user) {
            // Generic message — do not reveal whether email exists
            return res
                .status(401)
                .json({ success: false, message: 'Invalid email or password.' })
        }

        // 3. Verify password against stored hash
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res
                .status(401)
                .json({ success: false, message: 'Invalid email or password.' })
        }

        // 4. Issue token and return user profile
        const token = createToken(user._id)
        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || 'user',
            },
        })
    } catch (error) {
        console.error('loginUser error:', error.message)
        res.status(500).json({ success: false, message: 'Server error. Please try again.' })
    }
}

// POST /api/user/register
const registerUser = async (req, res) => {
    const { name, email, password } = req.body

    try {
        // 1. Required field checks
        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ success: false, message: 'Name, email, and password are required.' })
        }

        // 2. Validate email format
        if (!validator.isEmail(email)) {
            return res
                .status(400)
                .json({ success: false, message: 'Please enter a valid email address.' })
        }

        // 3. Minimum password length
        if (password.length < 8) {
            return res
                .status(400)
                .json({ success: false, message: 'Password must be at least 8 characters.' })
        }

        // 4. Check for duplicate email
        const exists = await userModel.findOne({ email: email.toLowerCase().trim() })
        if (exists) {
            return res
                .status(409)
                .json({ success: false, message: 'An account with this email already exists.' })
        }

        // 5. Hash the password — never store plaintext
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // 6. Create the user
        const user = await userModel.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
        })

        // 7. Issue token (user is auto-logged-in after registration)
        const token = createToken(user._id)
        res.status(201).json({ success: true, token })
    } catch (error) {
        console.error('registerUser error:', error.message)
        res.status(500).json({ success: false, message: 'Server error. Please try again.' })
    }
}

const getAdminSetupStatus = async (req, res) => {
    try {
        const adminExists = await userModel.exists({ role: 'admin' })
        res.json({
            success: true,
            setupAvailable: !adminExists,
        })
    } catch (error) {
        console.error('getAdminSetupStatus error:', error.message)
        res.status(500).json({ success: false, message: 'Failed to check administrator setup.' })
    }
}

const registerAdminAccount = async (req, res) => {
    const { name, email, password } = req.body || {}

    if (
        typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        !name.trim() ||
        !email.trim() ||
        !password
    ) {
        return res.status(400).json({
            success: false,
            message: 'Name, email, and password are required.',
        })
    }

    const normalizedEmail = email.toLowerCase().trim()
    if (!validator.isEmail(normalizedEmail)) {
        return res.status(400).json({
            success: false,
            message: 'Please enter a valid email address.',
        })
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters.',
        })
    }

    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const admin = await userModel.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: 'admin',
        })

        res.status(201).json({
            success: true,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.',
            })
        }

        console.error('registerAdminAccount error:', error.message)
        res.status(500).json({
            success: false,
            message: 'Failed to create administrator account.',
        })
    }
}

const registerFirstAdmin = async (req, res) => {
    try {
        await userModel.collection.createIndex(
            { adminSetupKey: 1 },
            {
                unique: true,
                partialFilterExpression: { adminSetupKey: 'first-admin' },
                name: 'unique_first_admin_setup',
            }
        )

        if (await userModel.exists({ role: 'admin' })) {
            return res.status(403).json({
                success: false,
                message: 'Administrator setup is already complete. Please sign in.',
            })
        }

        const { name, email, password } = req.body || {}
        if (
            typeof name !== 'string' ||
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            !name.trim() ||
            !email.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required.',
            })
        }

        const normalizedEmail = email.toLowerCase().trim()
        if (!validator.isEmail(normalizedEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address.',
            })
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters.',
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const admin = await userModel.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: 'admin',
            adminSetupKey: 'first-admin',
        })

        res.status(201).json({
            success: true,
            user: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        })
    } catch (error) {
        if (error.code === 11000) {
            try {
                if (await userModel.exists({ role: 'admin' })) {
                    return res.status(403).json({
                        success: false,
                        message: 'Administrator setup is already complete. Please sign in.',
                    })
                }
                return res.status(409).json({
                    success: false,
                    message: 'An account with this email already exists.',
                })
            } catch (lookupError) {
                console.error('registerFirstAdmin duplicate check error:', lookupError.message)
                return res.status(500).json({
                    success: false,
                    message: 'Failed to verify administrator setup.',
                })
            }
        }
        console.error('registerFirstAdmin error:', error.message)
        res.status(500).json({
            success: false,
            message: 'Failed to create administrator account.',
        })
    }
}

const getAdminAccounts = async (req, res) => {
    try {
        const admins = await userModel
            .find({ role: 'admin' })
            .select('_id name email createdAt')
            .sort({ createdAt: -1 })
        res.json({ success: true, data: admins })
    } catch (error) {
        console.error('getAdminAccounts error:', error.message)
        res.status(500).json({ success: false, message: 'Failed to retrieve administrator accounts.' })
    }
}

const createAdminAccount = async (req, res) => {
    const { name, email, password } = req.body || {}

    if (
        typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        !name.trim() ||
        !email.trim() ||
        !password
    ) {
        return res.status(400).json({
            success: false,
            message: 'Name, email, and password are required.',
        })
    }

    const normalizedEmail = email.toLowerCase().trim()
    if (!validator.isEmail(normalizedEmail)) {
        return res.status(400).json({
            success: false,
            message: 'Please enter a valid email address.',
        })
    }

    if (password.length < 8) {
        return res.status(400).json({
            success: false,
            message: 'Password must be at least 8 characters.',
        })
    }

    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const admin = await userModel.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: 'admin',
        })

        res.status(201).json({
            success: true,
            data: {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                createdAt: admin.createdAt,
            },
        })
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.',
            })
        }

        console.error('createAdminAccount error:', error.message)
        res.status(500).json({
            success: false,
            message: 'Failed to create administrator account.',
        })
    }
}

// GET /api/user/list  (admin — protected)
// Returns customer accounts only, excluding sensitive fields.
const listUsers = async (req, res) => {
    try {
        const users = await userModel
            .find({ role: { $in: ['user', null] } })
            .select('-password')
            .sort({ createdAt: -1 })
        res.json({ success: true, data: users })
    } catch (error) {
        console.error('listUsers error:', error.message)
        res.status(500).json({ success: false, message: 'Failed to retrieve user list.' })
    }
}

export {
    loginUser,
    registerUser,
    getAdminSetupStatus,
    registerAdminAccount,
    registerFirstAdmin,
    getAdminAccounts,
    createAdminAccount,
    listUsers,
}
