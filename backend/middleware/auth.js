import jwt from 'jsonwebtoken'
import userModel from '../models/userModel.js'

// Extracts and verifies the JWT from the Authorization header.
// On success, injects req.userId so downstream controllers can use it.
// Using req.userId (not req.body.userId) so this works correctly even
// when the request body is multipart/form-data (parsed by multer later).
// Returns 401 for missing, malformed, or expired tokens.
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization']

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized. Please log in.',
        })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        // Attach userId to req (not req.body) so it survives multipart parsing
        req.userId = decoded.id
        next()
    } catch (error) {
        const message =
            error.name === 'TokenExpiredError'
                ? 'Session expired. Please log in again.'
                : 'Invalid token. Please log in again.'
        return res.status(401).json({ success: false, message })
    }
}

// Admin-only authorization middleware.
// Strictly checks that the authenticated user has role === 'admin'.
const adminMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization']

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized. Please log in as an administrator.',
        })
    }

    const token = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decoded.id

        const user = await userModel.findById(decoded.id)
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Account not found. Please log in again.',
            })
        }

        const isAdmin = user.role === 'admin'
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Administrator privileges required.',
            })
        }

        req.user = user
        next()
    } catch (error) {
        const message =
            error.name === 'TokenExpiredError'
                ? 'Session expired. Please log in again.'
                : 'Invalid or expired token. Administrator access required.'
        return res.status(401).json({ success: false, message })
    }
}

export { authMiddleware, adminMiddleware }
export default authMiddleware
